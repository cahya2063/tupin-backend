import reviewCollection from "../models/review.js"
import userCollection from "../models/users.js"
import { createNotification } from "./notification.js"

const createReview = async(req, res, next)=>{// client, teknisi
    try {
        const {senderId, receiverId, jobId, rating, comment} = req.body
        const newRating = new reviewCollection({
            senderId: senderId,
            receiverId: receiverId,
            jobId: jobId,
            rating: rating,
            comment: comment
        })
        const senderUser = await userCollection.findOne({_id: senderId})
        const receiverUser = await userCollection.findOne({_id: receiverId})
        await newRating.save()
        createNotification(senderId, jobId, `berhasil memberi review ke ${receiverUser.nama}`)
        createNotification(receiverId, jobId, `${senderUser.nama} memberimu review`)
        res.status(201).json({
            message: 'berhasil memberi review'
        })
    } catch (error) {
        next(error)
    }
}
const getReviewByUserId = async(req, res, next)=>{//client teknisi
    try {
        const {userId} = req.params
        const review = await reviewCollection.find({
            receiverId: userId
        })
        if(!review){
            res.status(404).json({
                message: 'user belum melakukan review'
            })
        }
        res.status(200).json({
            message: `berhasil mengambil data review`,
            review: review
        })
    } catch (error) {
        next(error)
    }
}

const getReviewByJobId = async(req, res, next)=>{// client, teknisi
    try {
        const {jobId, userId} = req.params
        const review = await reviewCollection.findOne({
            jobId: jobId,
            senderId: userId
        })
        if(!review){
            res.status(404).json({
                message: 'user belum melakukan review',
                review: review
            })
        }
        res.status(200).json({
            message: `berhasil mengambil data review`,
            review: review
        })
    } catch (error) {
        next(error)
    }
}

export {createReview, getReviewByUserId, getReviewByJobId}