import express from 'express'
import { authRole } from '../middleware/auth.js'
import { getProvincesList } from '../controllers/ongkir.js'

const ongkirRouter = express.Router()
ongkirRouter.get('/check-provinces', authRole(['client']), getProvincesList)

export default ongkirRouter