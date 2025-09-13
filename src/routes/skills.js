import express from 'express'
import { getAllSkills } from '../controllers/skills.js'

const skillRouter = express.Router()

skillRouter.get('/', getAllSkills)
export {skillRouter}





