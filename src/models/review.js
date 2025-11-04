import mongoos from "../utils/db.js";

const ratingSchema = new mongoos.Schema({
    senderId: {
        type: String,
        required: true
    },
    receiverId: {
        type: String,
        required: true,
    },
    jobId: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const reviewCollection = mongoos.model('reviews', ratingSchema)
export default reviewCollection