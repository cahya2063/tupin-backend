import mongoos from "../utils/db.js";

const chatSchema = new mongoos.Schema({
    clientId: {
        type: String,
        required: true
    },
    technicianId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const chatCollection = mongoos.model('chats', chatSchema)
export default chatCollection







