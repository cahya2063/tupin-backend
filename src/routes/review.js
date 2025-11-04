import express from 'express'
import { createReview, getReviewByJobId, getReviewByUserId } from '../controllers/review.js'

const reviewRouter = express.Router()
reviewRouter.post('/create-review', createReview)
reviewRouter.get('/:userId/get-review', getReviewByUserId)
reviewRouter.get('/:jobId/:userId/get-review-byJobId', getReviewByJobId)

export default reviewRouter
