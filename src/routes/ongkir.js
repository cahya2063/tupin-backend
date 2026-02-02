import express from 'express'
import { authRole } from '../middleware/auth.js'
import { getCityList, getProvincesList } from '../controllers/ongkir.js'
import { getNearestTechnician } from '../services/ongkir.service.js'

const ongkirRouter = express.Router()
ongkirRouter.get('/check-provinces', authRole(['client']), getProvincesList)
ongkirRouter.get('/check-cities/:provinceId', authRole(['client']), getCityList)
// ongkirRouter.get('/nearest-technician', authRole(['client']), getNearestTechnician)
export default ongkirRouter