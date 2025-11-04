import reviewCollection from "../models/review.js"
import { createNotification } from "./notification.js"

const createReview = async(req, res, next)=>{
    try {
        const {senderId, receiverId, jobId, rating, comment} = req.body
        const newRating = new reviewCollection({
            senderId: senderId,
            receiverId: receiverId,
            jobId: jobId,
            rating: rating,
            comment: comment
        })
        await newRating.save()
        createNotification(receiverId, jobId, 'berhasil memberi rating ke teknisi')
        res.status(201).json({
            message: 'berhasil memberi rating'
        })
    } catch (error) {
        next(error)
    }
}
const getReviewByUserId = async(req, res, next)=>{
    try {
        const {userId} = req.params
        const review = await reviewCollection.find({
            receiverId: userId
        })
        res.status(200).json({
            message: `berhasil mengambil data review`,
            review: review
        })
    } catch (error) {
        next(error)
    }
}

export {createReview, getReviewByUserId}