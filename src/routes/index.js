import express from 'express';
import { postSignup } from '../controllers/register.js';
import mongoos from '../utils/db.js';
import authMiddleware from '../middleware/auth.js';
import { postLogin } from '../controllers/login.js';
import profileRouter from './profile.js';
import jobsRouter from './jobs.js';
import { skillRouter } from './skills.js';
import notificationRouter from './notification.js';
import chatRouter from './chat.js';
import messageRouter from './message.js';
import reviewRouter from './review.js';
const routes = express.Router();

routes.post('/signup', postSignup);
routes.post('/signin', postLogin)
routes.use('/profile', authMiddleware, profileRouter)
routes.use('/jobs', authMiddleware, jobsRouter)
routes.use('/skills', authMiddleware, skillRouter)
routes.use('/notifications', authMiddleware, notificationRouter)
routes.use('/chats', authMiddleware, chatRouter)
routes.use('/messages', authMiddleware, messageRouter)
routes.use('/review', authMiddleware, reviewRouter)
routes.get('/', (req, res) => {
  res.json({
    message: 'Hello World'
  })
});



export default routes;