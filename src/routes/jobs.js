import express from 'express'
import { addJob, applyJob, chooseTechnician, getAcceptedJob, getAllJob, getDetailJob, getJobByUser } from '../controllers/jobs.js'
import upload from '../middleware/upload.js'

const jobsRouter = express.Router()

jobsRouter.post('/', upload.single("photo"), addJob)
jobsRouter.get('/', getAllJob)
jobsRouter.get('/:id', getDetailJob)
jobsRouter.post("/:jobId/apply", applyJob);
jobsRouter.get("/uploaded/:userId", getJobByUser);
jobsRouter.post("/:jobId/choose-technician", chooseTechnician);
jobsRouter.get('/:technicianId/accepted-jobs', getAcceptedJob)

export default jobsRouter
