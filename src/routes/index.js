import express from 'express';
import { postSignupClient, postSignupTechncian } from '../controllers/register.js';
import mongoos from '../utils/db.js';
import {authMiddleware} from '../middleware/auth.js';
import { postLogin } from '../controllers/login.js';
import profileRouter from './profile.js';
import jobsRouter from './jobs.js';
import { skillRouter } from './skills.js';
import notificationRouter from './notification.js';
import chatRouter from './chat.js';
import messageRouter from './message.js';
import reviewRouter from './review.js';
import paymentRouter from './payment.js';
import { handleXenditWebhooksInvoices, handleXenditWebhooksPayout } from '../controllers/payment.js';
import ongkirRouter from './ongkir.js';
import { getNearestTechnician } from '../services/ongkir.service.js';
const routes = express.Router();

routes.post('/signup', postSignupClient);
routes.post('/signup-tech', postSignupTechncian);
routes.post('/signin', postLogin)
routes.use('/profile', authMiddleware, profileRouter)
routes.use('/jobs', authMiddleware, jobsRouter)
routes.use('/skills', authMiddleware, skillRouter)
routes.use('/notifications', authMiddleware, notificationRouter)
routes.use('/chats', authMiddleware, chatRouter)
routes.use('/messages', authMiddleware, messageRouter)
routes.use('/review', authMiddleware, reviewRouter)
routes.use('/payment', authMiddleware, paymentRouter)
routes.post('/nearest-technician', authMiddleware, getNearestTechnician)
routes.use('/ongkir', authMiddleware, ongkirRouter)

routes.post('/xendit-webhooks', handleXenditWebhooksInvoices)
routes.post('/xendit-webhooks-payout', handleXenditWebhooksPayout)
routes.get('/', (req, res) => {
  res.json({
    message: 'Hello World'
  })
});

// tambah ke dev



export default routes;