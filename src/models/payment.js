import mongoos from "../utils/db.js";

const paymentSchema = new mongoos.Schema({
    paymentId: {
        type: String,
        required: true
    },
    jobId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed']
    },
    paymentType: {
        type: String,
        required: false
    }
})

const paymentCollection = new mongoos.model('payments', paymentSchema)
export default paymentCollection;