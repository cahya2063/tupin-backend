import express from 'express'
import { authRole } from '../middleware/auth.js'
import { addReports } from '../controllers/reports.js'
import upload from '../middleware/upload.js'

const reportsRouter = express.Router()

reportsRouter.post('/:jobId/add-reports', upload.array('reports'), authRole(['client']), addReports)

export default reportsRouter
