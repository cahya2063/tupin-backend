import express from 'express'
import { getAllSkills, getSkillById } from '../controllers/skills.js'
import { authRole } from '../middleware/auth.js'

const skillRouter = express.Router()

skillRouter.get('/', authRole(['client']),getAllSkills)
skillRouter.get('/:id', authRole(['client']), getSkillById)
export {skillRouter}





