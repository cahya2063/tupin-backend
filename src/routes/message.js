import express from 'express'
import { createMessage, getMessageByChatId } from '../controllers/message.js'
import { authRole } from '../middleware/auth.js'

const messageRouter = express.Router()

messageRouter.post('/send',authRole(['technician', 'client']), createMessage)
messageRouter.get('/read/:chatId',authRole(['technician', 'client']), getMessageByChatId)

export default messageRouter
