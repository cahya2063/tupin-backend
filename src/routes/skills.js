import express from 'express'
import { getAllSkills, getSkillById } from '../controllers/skills.js'
import { authRole } from '../middleware/auth.js'

const skillRouter = express.Router()

skillRouter.get('/',getAllSkills)
skillRouter.get('/:id', authRole(['client', 'admin']), getSkillById)
export {skillRouter}





