import express from 'express'
import { createSubAccount, createTransactionGateway } from '../controllers/payment.js'

const paymentRouter = express.Router()

paymentRouter.post('/create-payment', createTransactionGateway)
paymentRouter.post('/create-subaccount', createSubAccount)


export default paymentRouter


