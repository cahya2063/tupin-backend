import express from 'express'
import { getProfile, updateAvatar, updateProfile } from '../controllers/profile.js'
import upload from '../middleware/upload.js'
const profileRouter = express.Router()

profileRouter.get('/:id', getProfile)
profileRouter.post('/:id', updateProfile)
profileRouter.post("/:id/avatar", upload.single("avatar"), updateAvatar);
export default profileRouter