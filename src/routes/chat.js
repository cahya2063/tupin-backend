import express from 'express'
import { createChat, getChatByUserId } from '../controllers/chat.js'

const chatRouter = express.Router()

chatRouter.post('/create', createChat)
chatRouter.get('/:userId', getChatByUserId)

export default chatRouter






