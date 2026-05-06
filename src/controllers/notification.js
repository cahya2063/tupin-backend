import notificationCollection from "../models/notification.js"
import nodemailer from 'nodemailer'

const getNotificationsByUser = async(req, res, next)=>{// client, teknisi
    try {
        const {userId} = req.params
        const notifications = await notificationCollection.find({userId: userId})

        if(!notifications || notifications.length === 0){
            return res.status(404).json({
                message: 'belum ada notifikasi'
            })
        }
        return res.status(200).json({
            message: 'berhasil mengambil notifikasi',
            notification: notifications
        })
    } catch (error) {
        next(error)
    }
}
const createNotification = async(userId, jobId, message)=>{// siapapun yang memanggil
   await notificationCollection.create({
        userId,
        jobId,
        message
    })
}

const readNotification = async(req, res, next)=>{// client, teknisi
    try {
        const {notificationId} = req.params
        const notification = await notificationCollection.findById(notificationId)
        if(!notification){
            return res.status(404).json({message: 'Notifikasi tidak ditemukan'})
        }
        notification.isRead = true
        await notification.save()
        return res.status(200).json({
            message: 'Berhasil membaca notifikasi',
            notification: notification
        })
    } catch (error) {
        next(error)
    }
}

const deleteNotification = async(req, res, next)=>{// client, teknisi
    try {
        const {notificationId} = req.params
        await notificationCollection.findByIdAndDelete(notificationId)
        return res.status(200).json({
            message: 'Notifikasi berhasil dihapus'
        })
    } catch (error) {
        next(error)
    }
}

async function sendEmailRegistrationFirstStep(destinationEmail){
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fixifymultiservis@gmail.com',
                pass: 'nrhougusoqlzgxhp'
            }
        })

        await transport.sendMail({
            from: '"Fixify Multi Servis" <fixifymultiservis@gmail.com>',
            to: destinationEmail,
            subject: 'Pendaftaran Berhasil 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
                    <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:10px;">
                        
                        <h2 style="color:#4CAF50; text-align:center;">
                            🎉 Pendaftaran Berhasil!
                        </h2>

                        <p style="font-size:16px; color:#333;">
                            Halo 👋,
                        </p>

                        <p style="font-size:15px; color:#555;">
                            Terima kasih sudah mendaftar di <b>Fixify Multi Servis</b>.
                            Saat ini akun kamu sedang diproses.
                        </p>

                        <p style="font-size:15px; color:#555;">
                            Silakan tunggu email aktivasi dari kami ya.
                        </p>

                        

                        <hr/>

                        <p style="font-size:12px; color:#999; text-align:center;">
                            Email ini dikirim otomatis, mohon tidak membalas.
                        </p>
                    </div>
                </div>
            `
        })
        console.log('email berhasil dikirim');
    } catch (error) {
        console.error(error);
    }
}


export {getNotificationsByUser, createNotification, readNotification, deleteNotification, sendEmailRegistrationFirstStep}