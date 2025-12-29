import express from 'express'
import { checkBalance, createInvoiceWithSplit, createPayout, createSplitRule, createTransactionGateway, getInvoices, handleXenditWebhooksInvoices, handleXenditWebhooksPayout } from '../controllers/payment.js'
import { getPayoutsChannels } from '../services/xendit.service.js'

const paymentRouter = express.Router()

paymentRouter.post('/create-payment', createTransactionGateway)
// paymentRouter.post('/create-subaccount', createSubAccount)
// paymentRouter.post('/create-splitrule', createSplitRule)
paymentRouter.get('/check-balance/:subAccountId', checkBalance)
paymentRouter.post('/create-invoice-with-split', createInvoiceWithSplit)
paymentRouter.get('/get-invoice/:receiverId', getInvoices)
// paymentRouter.post('/create-invoice', createInvoice)
paymentRouter.post('/create-payout', createPayout)
paymentRouter.post('/xendit-webhooks', handleXenditWebhooksInvoices)
paymentRouter.post('/xendit-webhooks-payout', handleXenditWebhooksPayout)
paymentRouter.get('/get-payout-channels', getPayoutsChannels)



export default paymentRouter