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
const createNotification = async(userId, jobId, message, category)=>{// siapapun yang memanggil
   await notificationCollection.create({
        userId,
        jobId,
        message,
        category
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

// const createJobNotification = async({userId = '', category = ''})=>{
//     await notificationCollection.create({
//         userId,
//         category,
//     })
// }

const countJobNotification = async(req, res, next)=>{// teknisi
    const {userId} = req.params
    
    const count = await notificationCollection.countDocuments({
        userId: userId,
        isRead: false,
        category: 'job_received'
    })

    if(count === 0){
        return res.status(404).json({
            message: 'belum ada notifikasi'
        })
    }
    return res.status(200).json({
        message: 'berhasil menghitung notifikasi',
        count: count
    })
}

const readCountJobNotification = async(req, res, next)=>{// teknisi
    console.log('userId : ', req.params.id);
    
    const notifications = await notificationCollection.find({
        userId: req.user.id,
        isRead: false,
        category: 'job_received'
    })
    
    notifications.forEach(async(notification)=>{
        notification.isRead = true
        await notification.save()
    })
    return res.status(200).json({
        message: 'berhasil membaca notifikasi',
    })
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

async function sendEmailRegistrationFirstStep(destinationEmail){// technician
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
async function sendActivationEmail(destinationEmail, activationLink) {// technician
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fixifymultiservis@gmail.com',
                pass: 'nrhougusoqlzgxhp'
            }
        });

        await transport.sendMail({
            from: '"Fixify Multi Servis" <fixifymultiservis@gmail.com>',
            to: destinationEmail,
            subject: 'Aktivasi Akun Teknisi 🔧',
            html: `
                <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
                    <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:12px;">
                        
                        <h2 style="color:#16a34a; text-align:center;">
                            🎉 Pendaftaran Teknisi Disetujui
                        </h2>

                        <p style="font-size:16px; color:#333;">
                            Halo 👋,
                        </p>

                        <p style="font-size:15px; color:#555; line-height:1.6;">
                            Selamat! Pendaftaran akun teknisi kamu di 
                            <b>Fixify Multi Servis</b> telah disetujui oleh admin.
                        </p>

                        <p style="font-size:15px; color:#555; line-height:1.6;">
                            Silakan lakukan aktivasi akun untuk membuat password
                            dan melengkapi data profil teknisi kamu.
                        </p>

                        <div style="text-align:center; margin:35px 0;">
                            <a 
                                href="${activationLink}"
                                style="
                                    background:#16a34a;
                                    color:white;
                                    padding:14px 24px;
                                    text-decoration:none;
                                    border-radius:8px;
                                    font-size:15px;
                                    font-weight:bold;
                                    display:inline-block;
                                "
                            >
                                Aktivasi Akun
                            </a>
                        </div>

                        <p style="font-size:14px; color:#666;">
                            Atau buka link berikut:
                        </p>

                        <p style="word-break:break-all; font-size:13px; color:#2563eb;">
                            ${activationLink}
                        </p>

                        <p style="font-size:14px; color:#ef4444;">
                            ⚠️ Link aktivasi hanya berlaku selama 1 jam.
                        </p>

                        <hr style="margin:30px 0;" />

                        <p style="font-size:12px; color:#999; text-align:center;">
                            Email ini dikirim otomatis, mohon tidak membalas email ini.
                        </p>
                    </div>
                </div>
            `
        });

        console.log('email aktivasi berhasil dikirim');

    } catch (error) {
        console.error(error);
    }
}

async function sendRejectTechnicianEmail(destinationEmail) {// technician
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fixifymultiservis@gmail.com',
                pass: 'nrhougusoqlzgxhp'
            }
        });

        await transport.sendMail({
            from: '"Fixify Multi Servis" <fixifymultiservis@gmail.com>',
            to: destinationEmail,
            subject: 'Pendaftaran Teknisi Ditolak',
            html: `
                <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
                    <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:12px;">
                        
                        <h2 style="color:#dc2626; text-align:center;">
                            ❌ Pendaftaran Teknisi Ditolak
                        </h2>

                        <p style="font-size:16px; color:#333;">
                            Halo 👋,
                        </p>

                        <p style="font-size:15px; color:#555; line-height:1.6;">
                            Terima kasih telah mendaftar sebagai teknisi di 
                            <b>Fixify Multi Servis</b>.
                        </p>

                        <p style="font-size:15px; color:#555; line-height:1.6;">
                            Setelah dilakukan peninjauan, saat ini pendaftaran
                            akun teknisi kamu belum dapat kami setujui.
                        </p>

                        <p style="font-size:15px; color:#555; line-height:1.6;">
                            Kamu tetap dapat melakukan pendaftaran kembali
                            di kemudian hari.
                        </p>

                        <hr style="margin:30px 0;" />

                        <p style="font-size:12px; color:#999; text-align:center;">
                            Email ini dikirim otomatis, mohon tidak membalas email ini.
                        </p>
                    </div>
                </div>
            `
        });

        console.log('email penolakan teknisi berhasil dikirim');

    } catch (error) {
        console.error(error);
    }
}

async function sendActivationClientEmail(destinationEmail, activationLink) {// technician
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fixifymultiservis@gmail.com',
                pass: 'nrhougusoqlzgxhp'
            }
        });

        await transport.sendMail({
            from: '"Fixify Multi Servis" <fixifymultiservis@gmail.com>',
            to: destinationEmail,
            subject: 'Aktivasi Akun Pelanggan 🔧',
            html: `
                <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
                    <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:12px;">
                        

                        <p style="font-size:16px; color:#333;">
                            Halo 👋,
                        </p>

                        <p style="font-size:15px; color:#555; line-height:1.6;">
                            Selamat! Pendaftaran akun kamu di Berhasil
                        </p>

                        <p style="font-size:15px; color:#555; line-height:1.6;">
                            Silakan lakukan aktivasi akun untuk membuat password
                            dan melengkapi data profil kamu.
                        </p>

                        <div style="text-align:center; margin:35px 0;">
                            <a 
                                href="${activationLink}"
                                style="
                                    background:#16a34a;
                                    color:white;
                                    padding:14px 24px;
                                    text-decoration:none;
                                    border-radius:8px;
                                    font-size:15px;
                                    font-weight:bold;
                                    display:inline-block;
                                "
                            >
                                Aktivasi Akun
                            </a>
                        </div>

                        <p style="font-size:14px; color:#666;">
                            Atau buka link berikut:
                        </p>

                        <p style="word-break:break-all; font-size:13px; color:#2563eb;">
                            ${activationLink}
                        </p>

                        <p style="font-size:14px; color:#ef4444;">
                            ⚠️ Link aktivasi hanya berlaku selama 1 jam.
                        </p>

                        <hr style="margin:30px 0;" />

                        <p style="font-size:12px; color:#999; text-align:center;">
                            Email ini dikirim otomatis, mohon tidak membalas email ini.
                        </p>
                    </div>
                </div>
            `
        });

        console.log('email aktivasi berhasil dikirim');

    } catch (error) {
        console.error(error);
    }
}

async function sendResetPasswordEmail(destinationEmail, resetLink) {
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fixifymultiservis@gmail.com',
                pass: 'nrhougusoqlzgxhp'
            }
        });

        await transport.sendMail({
            from: '"Fixify Multi Servis" <fixifymultiservis@gmail.com>',
            to: destinationEmail,
            subject: 'Reset Password Akun 🔑',
            html: `
                <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
                    <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:12px;">

                        <h2 style="color:#2563eb; text-align:center;">
                            🔑 Permintaan Reset Password
                        </h2>

                        <p style="font-size:16px; color:#333;">
                            Halo 👋,
                        </p>

                        <p style="font-size:15px; color:#555; line-height:1.6;">
                            Kami menerima permintaan untuk mengatur ulang password akun
                            <b>Fixify Multi Servis</b>.
                        </p>

                        <p style="font-size:15px; color:#555; line-height:1.6;">
                            Klik tombol di bawah ini untuk membuat password baru.
                            Jika kamu tidak pernah meminta reset password, abaikan email ini.
                        </p>

                        <div style="text-align:center; margin:35px 0;">
                            <a
                                href="${resetLink}"
                                style="
                                    background:#2563eb;
                                    color:white;
                                    padding:14px 24px;
                                    text-decoration:none;
                                    border-radius:8px;
                                    font-size:15px;
                                    font-weight:bold;
                                    display:inline-block;
                                "
                            >
                                Reset Password
                            </a>
                        </div>

                        <p style="font-size:14px; color:#666;">
                            Atau buka tautan berikut melalui browser:
                        </p>

                        <p style="
                            word-break:break-all;
                            font-size:13px;
                            color:#2563eb;
                        ">
                            ${resetLink}
                        </p>

                        <div style="
                            background:#fff7ed;
                            border-left:4px solid #f59e0b;
                            padding:12px;
                            border-radius:6px;
                            margin-top:20px;
                        ">
                            <p style="margin:0; font-size:14px; color:#92400e;">
                                ⚠️ Demi keamanan akun, tautan reset password ini hanya berlaku selama <b>30 menit</b>.
                            </p>
                        </div>

                        <hr style="margin:30px 0;" />

                        <p style="font-size:13px; color:#666; line-height:1.6;">
                            Jika kamu tidak merasa melakukan permintaan ini, tidak perlu melakukan tindakan apa pun.
                            Password akunmu tidak akan berubah sampai kamu membuat password baru melalui tautan di atas.
                        </p>

                        <p style="font-size:12px; color:#999; text-align:center; margin-top:30px;">
                            Email ini dikirim secara otomatis oleh <b>Fixify Multi Servis</b>.<br>
                            Mohon tidak membalas email ini.
                        </p>

                    </div>
                </div>
            `
        });

        console.log('Email reset password berhasil dikirim');

    } catch (error) {
        console.error(error);
    }
}

export {
    getNotificationsByUser, 
    createNotification, 
    countJobNotification,
    readCountJobNotification,
    // createJobNotification,
    readNotification, 
    deleteNotification, 
    sendEmailRegistrationFirstStep,
    sendActivationEmail,
    sendActivationClientEmail,
    sendRejectTechnicianEmail,
    sendResetPasswordEmail
}