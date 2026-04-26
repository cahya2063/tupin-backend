import mongoos from "../utils/db.js";
const payoutSchema = new mongoos.Schema({
    payoutId: {
        type: String,
        required: true
    },
    technicianId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    channelCode: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        required: false
    },
    referenceId: {
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true
    },
})

const payoutCollection = mongoos.model('payouts', payoutSchema)
export default payoutCollection



