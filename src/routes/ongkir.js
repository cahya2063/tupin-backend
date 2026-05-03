import express from 'express'
import { authRole } from '../middleware/auth.js'
import {  } from '../controllers/ongkir.js'
import { calculateShippingCost, getDestinationRequest, getNearestTechnician, getPosCode } from '../services/ongkir.service.js'

const ongkirRouter = express.Router()
// ongkirRouter.get('/check-provinces', authRole(['client']), getProvincesList)
// ongkirRouter.get('/check-cities/:provinceId', authRole(['client']), getCityList)
// ongkirRouter.get('/nearest-technician', authRole(['client']), getNearestTechnician)
ongkirRouter.get('/destination/:postCode', authRole(['client', 'technician']), getDestinationRequest)
ongkirRouter.post('/get-poscode', authRole(['technician', 'client']), getPosCode)
ongkirRouter.post('/calculate-shipping-cost', authRole(['technician']), calculateShippingCost)
export default ongkirRouter