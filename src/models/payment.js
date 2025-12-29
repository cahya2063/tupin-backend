import mongoos from "../utils/db.js";

const paymentSchema = new mongoos.Schema({
    invoiceId:{
        type: String,
        required: true
    },
    externalId: {
        type: String,
        required: true
    },
    jobId: {
        type: String,
        required: true
    },
    payerId: {
        type: String,
        required: true,
    },
    receiverId: {
        type: String,
        required: true
    },
    subAccountId: {
        type: String,
        required: false
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: false
    },
    paymentMethod: {
        type: String,
        required: false
    },
    paymentChannel: {
        type: String, 
        required: false,
    }
})

const paymentCollection = mongoos.model('payments', paymentSchema)
export default paymentCollection;