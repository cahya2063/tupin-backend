import express from 'express'
import { getNotificationsByUser } from '../controllers/notification.js'

const notificationRouter = express.Router()
notificationRouter.get('/:userId', getNotificationsByUser)

export default notificationRouter





