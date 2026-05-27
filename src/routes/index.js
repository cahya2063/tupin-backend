import express from 'express';
import { activateClient, activateTechnician, postSignupClient, signupTechncianFirstStep } from '../controllers/register.js';
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
// import { getNearestTechnician } from '../services/ongkir.service.js';
import warrantyRouter from './warranty.js';
import reportsRouter from './reports.js';
import dashboardRouter from './dashboard.js';
import upload from '../middleware/upload.js';
import { getNearestTechnician } from '../controllers/jobs.js';
const routes = express.Router();

routes.post('/signup', postSignupClient);

routes.post('/signup-tech',upload.fields([
    { name: 'ktp', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
  ]),
signupTechncianFirstStep);

routes.post('/technician/activate', activateTechnician);
routes.post('/client/activate', activateClient)
routes.post('/signin', postLogin)
routes.use('/profile', authMiddleware, profileRouter)
routes.use('/jobs', authMiddleware, jobsRouter)
routes.use('/skills', authMiddleware, skillRouter)
routes.use('/skills-register', skillRouter)
routes.use('/notifications', authMiddleware, notificationRouter)
routes.use('/chats', authMiddleware, chatRouter)
routes.use('/messages', authMiddleware, messageRouter)
routes.use('/review', authMiddleware, reviewRouter)
routes.use('/payment', authMiddleware, paymentRouter)
routes.use('/warranty', authMiddleware, warrantyRouter)
routes.use('/reports', authMiddleware, reportsRouter)
routes.use('/dashboard', authMiddleware, dashboardRouter)
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
