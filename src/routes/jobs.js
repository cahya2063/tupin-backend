import express from 'express'
import { addJob, applyJob, approveJobRequest, cancelJobs, chooseTechnician, doneJob, getAcceptedJob, getAllJob, getDetailJob, getJobByUser, isJobCompleted, technicianRequest } from '../controllers/jobs.js'
import upload from '../middleware/upload.js'
import { authRole } from '../middleware/auth.js'

const jobsRouter = express.Router()

jobsRouter.post('/', upload.single("photo"), authRole(['client']), addJob)
jobsRouter.get('/', authRole(['technician']), getAllJob)
jobsRouter.get('/:id',authRole(['technician', 'client']), getDetailJob)
jobsRouter.post("/:jobId/apply",authRole(['technician']), applyJob);
jobsRouter.get("/uploaded/:userId",authRole(['client']), getJobByUser);
jobsRouter.post("/:jobId/choose-technician",authRole(['client']), chooseTechnician);
jobsRouter.get('/:technicianId/accepted-jobs', authRole(['technician']), getAcceptedJob)
jobsRouter.post('/:jobId/technician-request',authRole(['technician']), technicianRequest)
jobsRouter.post('/:jobId/approve-job-request',authRole(['client']), approveJobRequest)
jobsRouter.post('/:jobId/done-job',authRole(['technician']), doneJob)
jobsRouter.post('/:jobId/is-job-completed',authRole(['client']), isJobCompleted)
jobsRouter.post('/:jobId/cancel-jobs',authRole(['technician', 'client']), cancelJobs)

export default jobsRouter
