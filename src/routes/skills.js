import express from 'express'
import { createSkills, deleteSkills, getAllSkills, getSkillById, updateSkills } from '../controllers/skills.js'
import { authRole } from '../middleware/auth.js'

const skillRouter = express.Router()

skillRouter.get('/',getAllSkills)
skillRouter.get('/:id', authRole(['client', 'admin']), getSkillById)
skillRouter.post('/create-skills', authRole(['admin']), createSkills)
skillRouter.post('/:skillId/update-skills', authRole(['admin']), updateSkills)
skillRouter.delete('/:skillId/delete-skills', authRole(['admin']), deleteSkills)
export {skillRouter}





