import express from 'express'
import { createMessage, getMessageByChatId } from '../controllers/message.js'

const messageRouter = express.Router()

messageRouter.post('/send', createMessage)
messageRouter.get('/read/:chatId', getMessageByChatId)

export default messageRouter
