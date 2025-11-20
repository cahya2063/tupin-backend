import express from 'express'
import { createTransactionGateway } from '../controllers/payment.js'

const paymentRouter = express.Router()

paymentRouter.post('/create-payment', createTransactionGateway)


export default paymentRouter


