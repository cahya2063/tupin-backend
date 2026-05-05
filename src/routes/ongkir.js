import express from 'express'
import { authRole } from '../middleware/auth.js'
import {  } from '../controllers/ongkir.js'
import { calculateShippingCost, getDestinationRequest, getNearestTechnician, getPosCode } from '../services/ongkir.service.js'

const ongkirRouter = express.Router()
ongkirRouter.get('/destination/:postCode', authRole(['client', 'technician']), getDestinationRequest)
ongkirRouter.post('/get-poscode', authRole(['technician', 'client']), getPosCode)
ongkirRouter.post('/:jobId/calculate-shipping-cost', authRole(['technician']), calculateShippingCost)
export default ongkirRouter