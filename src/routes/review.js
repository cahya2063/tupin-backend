import express from 'express'
import { createReview, getReviewByUserId } from '../controllers/review.js'

const reviewRouter = express.Router()
reviewRouter.post('/create-review', createReview)
reviewRouter.get('/:userId/get-review', getReviewByUserId)

export default reviewRouter
