import messageCollection from "../models/messages.js"
import { io } from "../index.js"
import chatCollection from "../models/chats.js"

const getMessageByChatId = async (req, res, next)=>{// client, teknisi
    try {
        const {chatId} = req.params
        const messages = await messageCollection.find({chatId : chatId})
        messages.forEach(async(message)=>{
            if(message.receiverId.toString() === req.user.id.toString()){
                message.isRead = true
                await message.save()
            }}
        )
        if(!messages){
            return res.status(404).json({
                message: 'belum ada pesan'
            })
        }
        return res.status(200).json({
            message: 'berhasil mengambil pesan chat',
            chat_message: messages
        })
    } catch (error) {
        next(error)
    }
}
//test 1
const createMessage = async (req, res, next)=>{// client, teknisi
    try {
        const {chatId, senderId, message, messageType} = req.body

        let receiverId

        const chat = await chatCollection.findOne({
            _id: chatId,
            $or: [
                { clientId: senderId },
                { technicianId: senderId }
            ]
        })

        if (chat.clientId.toString() === senderId.toString()) {
            receiverId = chat.technicianId
        } else {
            receiverId = chat.clientId
        }

        let newMessage;
        let uploadedImages = [];
        if (req.files && req.files.length > 0) {
            uploadedImages = req.files.map(file => file.filename);
        }
        
        if(messageType == 'location'){
            newMessage = new messageCollection({
                chatId,
                senderId,
                receiverId,
                messageType,
                message: message || 'Location',
                latitude: req.body.latitude,
                longitude: req.body.longitude
            })
        }
        else if(messageType == 'image' || uploadedImages.length > 0){
            newMessage = new messageCollection({
                chatId,
                senderId,
                receiverId,
                messageType: 'image',
                message: message || '',
                images: uploadedImages
            })
        }
        else if(messageType == 'message'){

            newMessage = new messageCollection({
                chatId,
                senderId,
                receiverId,
                messageType,
                message
            })
    
        }
        await newMessage.save()
        
        // kirim pesan real-time ke room chat
        io.to(chatId).emit('receive_message', newMessage)
        
        return res.status(201).json({
            message: 'pesan berhasil terkirim'
        })
    } catch (error) {
        next(error)
    }
}

const getCountMessage = async(req, res, next)=>{
    try {
        const messageCount = await messageCollection.countDocuments({
            receiverId: req.user.id,
            isRead: false
        })
        return res.status(200).json({
            message: 'berhasil menghitung pesan yang belum dibaca',
            count: messageCount
        })
    } catch (error) {
        next(error)
    }
}



export {
    getMessageByChatId, 
    createMessage,
    getCountMessage
}