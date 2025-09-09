import express from 'express';
import { postSignup } from '../controllers/register.js';
import mongoos from '../utils/db.js';
import authMiddleware from '../middleware/auth.js';
import { postLogin } from '../controllers/login.js';
const routes = express.Router();

routes.post('/signup', postSignup);
routes.post('/signin', postLogin)

routes.get('/', (req, res) => {
  res.json({
    message: 'Hello World'
  })
});

routes.get('/profile', authMiddleware, (req, res)=>{
  res.json({
    message: 'ini halaman profile',
    user: req.user
  })
})

export default routes;