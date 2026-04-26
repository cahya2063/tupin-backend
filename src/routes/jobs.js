import express from 'express'
import { addJob, cancelJobs, checkedJob, doneJob, getAcceptedJob, getAllJob, getDetailJob, getJobByUser, getJobHistory, isJobCompleted } from '../controllers/jobs.js'
import upload from '../middleware/upload.js'
import { authRole } from '../middleware/auth.js'

const jobsRouter = express.Router()

jobsRouter.post('/', upload.array("photos"), authRole(['client']), addJob)
jobsRouter.get('/', authRole(['technician']), getAllJob)
jobsRouter.get('/:id',authRole(['technician', 'client']), getDetailJob)
// jobsRouter.post("/:jobId/apply",authRole(['technician']), applyJob);
jobsRouter.get("/uploaded/:userId",authRole(['client']), getJobByUser);
// jobsRouter.post("/:jobId/choose-technician",authRole(['client']), chooseTechnician);
jobsRouter.get('/:technicianId/accepted-jobs', authRole(['technician']), getAcceptedJob)
jobsRouter.get('/:technicianId/job-history', authRole(['client']), getJobHistory)
jobsRouter.post('/:jobId/checked-job', authRole(['client']), checkedJob)
// jobsRouter.post('/:jobId/add-price', authRole(['client']), addPriceToJob)
// jobsRouter.post('/:jobId/technician-request',authRole(['technician']), technicianRequest)
// jobsRouter.post('/:jobId/approve-job-request',authRole(['technician']), approveJobRequest)
jobsRouter.post('/:jobId/done-job',authRole(['client']), doneJob)
jobsRouter.post('/:jobId/is-job-completed',authRole(['client']), isJobCompleted)
jobsRouter.post('/:jobId/cancel-jobs',authRole(['technician', 'client']), cancelJobs)

export default jobsRouter
