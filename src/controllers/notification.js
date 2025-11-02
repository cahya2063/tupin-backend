import notificationCollection from "../models/notification.js"

const getNotificationsByUser = async(req, res, next)=>{
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
const createNotification = async(userId, jobId, message)=>{
   await notificationCollection.create({
        userId,
        jobId,
        message
    })
}

const readNotification = async(req, res, next)=>{
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

const deleteNotification = async(req, res, next)=>{
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

export {getNotificationsByUser, createNotification, readNotification, deleteNotification}