import express from 'express'
import { authRole } from '../middleware/auth.js'
import { claimWarranty, createWarranty } from '../controllers/warranty.js'
import upload from '../middleware/upload.js'

const warrantyRouter = express.Router()

warrantyRouter.post('/:jobId/claim-warranty', upload.array("evidence"), authRole(['client']), createWarranty)

export default warrantyRouter