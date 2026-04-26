import mongoos from "../utils/db.js";

const transfersSchema = new mongoos.Schema({
    referenceId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    paymentId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
})
const transfersCollection = mongoos.model('transfers', transfersSchema)
export default transfersCollection