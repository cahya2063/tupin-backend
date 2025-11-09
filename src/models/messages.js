import mongoos from "../utils/db.js";

const messageSchema = new mongoos.Schema({
    chatId: {
        type: String,
        required: true
    },
    senderId: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: ['message', 'location'],
        default: 'message'
    },
    message: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: false
    },
    longitude: {
        type: Number,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
})

const messageCollection = mongoos.model('messages', messageSchema)
export default messageCollection







