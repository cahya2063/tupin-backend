import express from 'express'
import { getProfile, updateProfile } from '../controllers/profile.js'
const profileRouter = express.Router()

profileRouter.get('/:id', getProfile)
profileRouter.post('/:id', updateProfile)

export default profileRouter