import express from 'express';
import { postSignup } from '../controllers/register.js';
import mongoos from '../utils/db.js';
import authMiddleware from '../middleware/auth.js';
import { postLogin } from '../controllers/login.js';
import profileRouter from './profile.js';
const routes = express.Router();

routes.post('/signup', postSignup);
routes.post('/signin', postLogin)
routes.use('/profile', authMiddleware, profileRouter)
routes.get('/', (req, res) => {
  res.json({
    message: 'Hello World'
  })
});



export default routes;