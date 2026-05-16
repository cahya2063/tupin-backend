import express from 'express'
import { authRole } from '../middleware/auth.js'
import { addReports, approveReport, disableTechnician, getAllReports, getReportsByJobId, getReportsByTechnicianId, getReportsByUserId, rejectReport } from '../controllers/reports.js'
import upload from '../middleware/upload.js'

const reportsRouter = express.Router()

reportsRouter.post('/:jobId/add-reports', upload.array('reports'), authRole(['client']), addReports)
reportsRouter.get('/:jobId/get-reports-by-jobId', authRole(['client', 'technician']), getReportsByJobId)
reportsRouter.get('/:userId/get-reports-by-userId', authRole(['client', 'technician', 'admin']), getReportsByUserId)
reportsRouter.get('/:technicianId/get-reports-by-technicianId', authRole(['admin']), getReportsByTechnicianId)
reportsRouter.get('/get-all-reports', authRole(['admin']), getAllReports)
reportsRouter.post('/:reportId/approve-report', authRole(['admin']), approveReport)
reportsRouter.post('/:reportId/reject-report', authRole(['admin']), rejectReport)
reportsRouter.post('/:technicianId/disable-technician', authRole(['admin']), disableTechnician)


export default reportsRouter
