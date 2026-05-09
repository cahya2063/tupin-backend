import mongoos from "../utils/db.js";

const warrantySchema = new mongoos.Schema({
    jobId: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    evidence: {
        type: Array,
        required: false,
    },
    status: {
        type: String,
        enum: ['claimed', 'repairing', 'rejected', 'done'],
        default: 'claimed'
    },
    refundAmount: {
        type: Number,
        required: false
    },
    isResolved: {
        type: Boolean,
        default: false
    }
})

const warrantyCollection = mongoos.model('warranties', warrantySchema)
export default warrantyCollection