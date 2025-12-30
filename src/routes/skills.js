import express from 'express'
import { getAllSkills } from '../controllers/skills.js'
import { authRole } from '../middleware/auth.js'

const skillRouter = express.Router()

skillRouter.get('/', authRole(['client']),getAllSkills)
export {skillRouter}





