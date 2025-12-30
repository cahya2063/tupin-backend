import express from 'express'
import { getProfile, updateAvatar, updateProfile } from '../controllers/profile.js'
import upload from '../middleware/upload.js'
import { authRole } from '../middleware/auth.js'
const profileRouter = express.Router()

profileRouter.get('/:id', authRole(['technician', 'client']), getProfile)
profileRouter.post('/:id', authRole(['technician', 'client']), updateProfile)
profileRouter.post("/:id/avatar", upload.single("avatar"), authRole(['technician', 'client']), updateAvatar);
export default profileRouter