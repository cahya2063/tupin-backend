import jobsCollection from "../models/jobs.js"
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
        return res.status(201).json({
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
            return res.status(404).json({
                message: 'user belum melakukan review'
            })
        }
        return res.status(200).json({
            message: `berhasil mengambil data review`,
            review: review
        })
    } catch (error) {
        next(error)
    }
}

const getReviewByJobId = async(req, res, next)=>{// client, teknisi
    try {
        const {jobId} = req.params
        const review = await reviewCollection.findOne({
            jobId: jobId,
            // senderId: userId
        })
        if(!review){
            return res.status(404).json({
                message: 'user belum melakukan review',
                review: review
            })
        }
        return res.status(200).json({
            message: `berhasil mengambil data review`,
            review: review
        })
    } catch (error) {
        next(error)
    }
}

const getTechnicianStatistics = async (req, res, next) => {
  try {
    const { receiverId } = req.params

    // ambil data rating
    const ratingResult = await reviewCollection.aggregate([
      {
        $match: {
          receiverId: receiverId
        }
      },
      {
        $group: {
          _id: '$receiverId',
          avgRating: { $avg: '$rating' },
          totalReview: { $sum: 1 }
        }
      }
    ])

    // hitung jumlah job completed
    const completedJobs = await jobsCollection.countDocuments({
      selectedTechnician: receiverId,
      status: 'completed'
    })

    return res.status(200).json({
      success: true,
      receiverId,

      avgRating:
        ratingResult.length > 0
          ? Number(ratingResult[0].avgRating.toFixed(1))
          : 0,

      totalReview:
        ratingResult.length > 0
          ? ratingResult[0].totalReview
          : 0,

      completedJobs
    })

  } catch (error) {
    next(error)
  }
}
export {createReview, getReviewByUserId, getReviewByJobId, getTechnicianStatistics}