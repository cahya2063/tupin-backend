import express from 'express'
import { checkBalance, createInvoiceWithSplit, createPayout, createSplitRule, createTransactionGateway, getInvoices, handleXenditWebhooksInvoices, handleXenditWebhooksPayout } from '../controllers/payment.js'
import { getPayoutsChannels } from '../services/xendit.service.js'
import { authRole } from '../middleware/auth.js'

const paymentRouter = express.Router()


paymentRouter.post('/create-payment',authRole(['client']), createTransactionGateway)
// paymentRouter.post('/create-subaccount', createSubAccount)
// paymentRouter.post('/create-splitrule', createSplitRule)
paymentRouter.get('/check-balance/:subAccountId',authRole(['technician']), checkBalance)
paymentRouter.post('/create-invoice-with-split',authRole(['client']), createInvoiceWithSplit)
paymentRouter.get('/get-invoice/:userId',authRole(['client']), getInvoices)
// paymentRouter.post('/create-invoice', createInvoice)
paymentRouter.post('/create-payout',authRole(['technician']), createPayout)

paymentRouter.get('/get-payout-channels', getPayoutsChannels)


export default paymentRouter