import express from 'express'
import { createReview } from '../controllers/review.js'

const reviewRouter = express.Router()
reviewRouter.post('/create-review', createReview)

export default reviewRouter
