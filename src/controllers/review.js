import ratingCollection from "../models/review.js"
import { createNotification } from "./notification.js"

const createReview = async(req, res, next)=>{
    try {
        const {senderId, receiverId, jobId, rating, comment} = req.body
        const newRating = new ratingCollection({
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

export {createReview}