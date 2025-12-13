import express from 'express'
import { createInvoice, createTransactionGateway, handleXenditWebhooks } from '../controllers/payment.js'

const paymentRouter = express.Router()

paymentRouter.post('/create-payment', createTransactionGateway)
// paymentRouter.post('/create-subaccount', createSubAccount)
// paymentRouter.post('/create-splitrule', createSplitRule)
paymentRouter.post('/create-invoice', createInvoice)
paymentRouter.post('/xendit-webhooks', handleXenditWebhooks)



export default paymentRouter