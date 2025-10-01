import mongoos from "../utils/db";

const messageSchema = new mongoos.Schema({
    chatId: {
        type: String,
        required: true
    },
    senderId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const messageCollection = mongoos.model('messages', messageSchema)
export default messageCollection







