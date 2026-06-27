import express from 'express'
import { authRole } from '../middleware/auth.js'
import {  } from '../controllers/ongkir.js'
import { calculatePickupFee, calculateShippingCost, getDestinationRequest, getPosCode } from '../services/ongkir.service.js'

const ongkirRouter = express.Router()
ongkirRouter.get('/destination/:postCode', authRole(['client', 'technician']), getDestinationRequest)
ongkirRouter.post('/get-poscode', authRole(['technician', 'client']), getPosCode)
ongkirRouter.post('/:jobId/calculate-shipping-cost', authRole(['technician']), calculatePickupFee)
export default ongkirRouter