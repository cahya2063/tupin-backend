import express from 'express'
import { authRole } from '../middleware/auth.js'
import { approveWarranties, createWarranty, doneWarranty, getWarranties, rejectWarranty } from '../controllers/warranty.js'
import upload from '../middleware/upload.js'

const warrantyRouter = express.Router()

warrantyRouter.post('/:jobId/claim-warranty', upload.array("evidence"), authRole(['client']), createWarranty)
warrantyRouter.get('/:userId/get-warranties', authRole(['client', 'technician']), getWarranties)
warrantyRouter.post('/:warrantyId/approve-warranty', authRole(['client', 'technician']), approveWarranties)
warrantyRouter.post('/:warrantyId/done-warranty', authRole(['client']), doneWarranty)
warrantyRouter.post('/:warrantyId/reject-warranty', authRole(['technician']), rejectWarranty)
export default warrantyRouter