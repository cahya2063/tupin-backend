import express from 'express'
import { addJob } from '../controllers/jobs.js'

const jobsRouter = express.Router()

jobsRouter.post('/', addJob)

export default jobsRouter




