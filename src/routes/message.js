import express from 'express'
import { createMessage, getMessageByChatId } from '../controllers/message.js'
import { authRole } from '../middleware/auth.js'
import upload from '../middleware/upload.js'

const messageRouter = express.Router()

messageRouter.post('/send',authRole(['technician', 'client']), upload.array('images', 10), createMessage)
messageRouter.get('/read/:chatId',authRole(['technician', 'client']), getMessageByChatId)

export default messageRouter
