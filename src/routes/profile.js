import express from 'express'
import { getProfile, getTechnicianPending, updateAvatar, updateProfile } from '../controllers/profile.js'
import upload from '../middleware/upload.js'
import { authRole } from '../middleware/auth.js'
import { approveTechnician, rejectTechnician } from '../controllers/register.js'
const profileRouter = express.Router()

profileRouter.get('/get-pending-technician', authRole(['admin']), getTechnicianPending)
profileRouter.get('/:id', authRole(['technician', 'client', 'admin']), getProfile)
profileRouter.post('/approve/:technicianId', authRole(['admin']), approveTechnician)
profileRouter.post('/reject/:technicianId', authRole(['admin']), rejectTechnician)
profileRouter.post('/:id', authRole(['technician', 'client']), updateProfile)
profileRouter.post("/:id/avatar", upload.single("avatar"), authRole(['technician', 'client']), updateAvatar);
export default profileRouter
