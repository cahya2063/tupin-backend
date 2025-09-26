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


export {getNotificationsByUser}