import express from 'express'
import { createMessage, getCountMessage, getMessageByChatId } from '../controllers/message.js'
import { authRole } from '../middleware/auth.js'
import upload from '../middleware/upload.js'

const messageRouter = express.Router()

messageRouter.post('/send',authRole(['technician', 'client']), upload.array('images', 10), createMessage)
messageRouter.get('/read/:chatId',authRole(['technician', 'client']), getMessageByChatId)
messageRouter.get('/count-message', authRole(['technician', 'client']), getCountMessage)

export default messageRouter
