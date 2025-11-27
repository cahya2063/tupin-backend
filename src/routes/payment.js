import express from 'express'
import { createInvoiceWithSplit, createSplitRule, createSubAccount, createTransactionGateway, handleXenditWebhooks } from '../controllers/payment.js'

const paymentRouter = express.Router()

paymentRouter.post('/create-payment', createTransactionGateway)
paymentRouter.post('/create-subaccount', createSubAccount)
paymentRouter.post('/create-splitrule', createSplitRule)
paymentRouter.post('/create-invoice-with-split', createInvoiceWithSplit)
paymentRouter.post('/xendit-webhooks', handleXenditWebhooks)



export default paymentRouter



