import express from 'express'
import { checkBalance, createInvoiceWithSplit, createPayout, createSplitRule, createTransactionGateway, handleXenditWebhooksInvoices } from '../controllers/payment.js'

const paymentRouter = express.Router()

paymentRouter.post('/create-payment', createTransactionGateway)
// paymentRouter.post('/create-subaccount', createSubAccount)
paymentRouter.post('/create-splitrule', createSplitRule)
paymentRouter.get('/check-balance/:userId', checkBalance)
paymentRouter.post('/create-invoice-with-split', createInvoiceWithSplit)
// paymentRouter.post('/create-invoice', createInvoice)
paymentRouter.post('/create-payout', createPayout)
paymentRouter.post('/xendit-webhooks', handleXenditWebhooksInvoices)



export default paymentRouter