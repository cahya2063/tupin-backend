import express from 'express'
import { addJob, applyJob, getAllJob, getDetailJob } from '../controllers/jobs.js'
import upload from '../middleware/upload.js'

const jobsRouter = express.Router()

jobsRouter.post('/', upload.single("photo"), addJob)
jobsRouter.get('/', getAllJob)
jobsRouter.get('/:id', getDetailJob)
jobsRouter.post("/:jobId/apply", applyJob);

export default jobsRouter




