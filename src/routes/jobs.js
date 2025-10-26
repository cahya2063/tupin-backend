import express from 'express'
import { addJob, applyJob, approveJobRequest, cancelJobs, chooseTechnician, doneJob, getAcceptedJob, getAllJob, getDetailJob, getJobByUser, isJobCompleted, technicianRequest } from '../controllers/jobs.js'
import upload from '../middleware/upload.js'

const jobsRouter = express.Router()

jobsRouter.post('/', upload.single("photo"), addJob)
jobsRouter.get('/', getAllJob)
jobsRouter.get('/:id', getDetailJob)
jobsRouter.post("/:jobId/apply", applyJob);
jobsRouter.get("/uploaded/:userId", getJobByUser);
jobsRouter.post("/:jobId/choose-technician", chooseTechnician);
jobsRouter.get('/:technicianId/accepted-jobs', getAcceptedJob)
jobsRouter.post('/:jobId/technician-request', technicianRequest)
jobsRouter.post('/:jobId/approve-job-request', approveJobRequest)
jobsRouter.post('/:jobId/done-job', doneJob)
jobsRouter.post('/:jobId/is-job-completed', isJobCompleted)
jobsRouter.post('/:jobId/cancel-jobs', cancelJobs)

export default jobsRouter
