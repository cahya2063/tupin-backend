import express from 'express'
import { createReview, getReviewByJobId, getReviewByUserId, getTechnicianStatistics } from '../controllers/review.js'
import { authRole } from '../middleware/auth.js'

const reviewRouter = express.Router()
reviewRouter.post('/create-review', authRole(['technician', 'client']), createReview)
reviewRouter.get('/:userId/get-review', authRole(['technician', 'client']), getReviewByUserId)
reviewRouter.get('/:jobId/get-review-byJobId', authRole(['technician', 'client']), getReviewByJobId)
reviewRouter.get('/:receiverId/get-technician-statistics', authRole(['client', 'technician', 'admin']), getTechnicianStatistics)

export default reviewRouter
