import express from 'express'
import { deleteNotification, getNotificationsByUser, readNotification } from '../controllers/notification.js'
import { authRole } from '../middleware/auth.js'

const notificationRouter = express.Router()
notificationRouter.get('/:userId',authRole(['technician', 'client']), getNotificationsByUser)
notificationRouter.get('/read/:notificationId',authRole(['technician', 'client']), readNotification)
notificationRouter.delete('/delete/:notificationId',authRole(['technician', 'client']), deleteNotification)

export default notificationRouter





