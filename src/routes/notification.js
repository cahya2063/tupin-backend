import express from 'express'
import { deleteNotification, getNotificationsByUser, readNotification } from '../controllers/notification.js'

const notificationRouter = express.Router()
notificationRouter.get('/:userId', getNotificationsByUser)
notificationRouter.get('/read/:notificationId', readNotification)
notificationRouter.delete('/delete/:notificationId', deleteNotification)

export default notificationRouter





