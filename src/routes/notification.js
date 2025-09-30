import express from 'express'
import { getNotificationsByUser, readNotification } from '../controllers/notification.js'

const notificationRouter = express.Router()
notificationRouter.get('/:userId', getNotificationsByUser)
notificationRouter.get('/read/:notificationId', readNotification)

export default notificationRouter





