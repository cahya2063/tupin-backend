import express from 'express'
import { createChat, getChatByUserId } from '../controllers/chat.js'
import { authRole } from '../middleware/auth.js'

const chatRouter = express.Router()

chatRouter.post('/create',authRole(['technician', 'client']), createChat)
chatRouter.get('/:userId',authRole(['technician', 'client']), getChatByUserId)

export default chatRouter






