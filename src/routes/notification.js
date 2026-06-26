import express from 'express'
import { countJobNotification, deleteNotification, getNotificationsByUser, readCountJobNotification, readNotification } from '../controllers/notification.js'
import { authRole } from '../middleware/auth.js'

const notificationRouter = express.Router()
notificationRouter.get('/read-count-notification',authRole(['technician', 'client', 'admin']), readCountJobNotification)
notificationRouter.get('/:userId',authRole(['technician', 'client', 'admin']), getNotificationsByUser)
notificationRouter.get('/count-notification/:userId',authRole(['technician', 'client', 'admin']), countJobNotification)
notificationRouter.get('/read/:notificationId',authRole(['technician', 'client']), readNotification)
notificationRouter.delete('/delete/:notificationId',authRole(['technician', 'client']), deleteNotification)

export default notificationRouter





