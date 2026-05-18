import express from 'express'
import { addJob, cancelJobs, checkedJob, deleteReportedJob, doneJob, getAcceptedJob, getAllJob, getDetailJob, getJobByUser, getJobHistory, getReportedJob, reportJob } from '../controllers/jobs.js'
import upload from '../middleware/upload.js'
import { authRole } from '../middleware/auth.js'

const jobsRouter = express.Router()

jobsRouter.get('/get-reported-jobs', authRole(['admin']), getReportedJob)
jobsRouter.post('/', upload.array("photos"), authRole(['client']), addJob)
jobsRouter.get('/', authRole(['technician']), getAllJob)
jobsRouter.get('/:id',authRole(['technician', 'client']), getDetailJob)
jobsRouter.get("/uploaded/:userId",authRole(['client']), getJobByUser);
jobsRouter.get('/:technicianId/accepted-jobs', authRole(['technician']), getAcceptedJob)
jobsRouter.get('/:technicianId/job-history', authRole(['client']), getJobHistory)
jobsRouter.post('/:jobId/checked-job', authRole(['client']), checkedJob)
jobsRouter.post('/:jobId/done-job',authRole(['client']), doneJob)
jobsRouter.post('/:jobId/cancel-jobs',authRole(['technician', 'client']), cancelJobs)
jobsRouter.post('/:jobId/report-job', authRole(['technician']), reportJob)
jobsRouter.post('/:jobId/delete-jobs', authRole(['admin']), deleteReportedJob)

export default jobsRouter
