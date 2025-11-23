import express from 'express'
import { createSplitRule, createSubAccount, createTransactionGateway } from '../controllers/payment.js'

const paymentRouter = express.Router()

paymentRouter.post('/create-payment', createTransactionGateway)
paymentRouter.post('/create-subaccount', createSubAccount)
paymentRouter.post('/create-splitrule', createSplitRule)


export default paymentRouter


