import messageCollection from "../models/messages.js"
import { io } from "../index.js"

const getMessageByChatId = async (req, res, next)=>{// client, teknisi
    try {
        const {chatId} = req.params
        const messages = await messageCollection.find({chatId : chatId})
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

        // console.log('type : ',messageType);
        let newMessage;
        let uploadedImages = [];
        if (req.files && req.files.length > 0) {
            uploadedImages = req.files.map(file => file.filename);
        }
        
        if(messageType == 'location'){
            newMessage = new messageCollection({
                chatId,
                senderId,
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
                messageType: 'image',
                message: message || '',
                images: uploadedImages
            })
        }
        else if(messageType == 'message'){

            newMessage = new messageCollection({
                chatId,
                senderId,
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



export {getMessageByChatId, createMessage}