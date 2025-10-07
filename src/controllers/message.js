import messageCollection from "../models/messages.js"
import { io } from "../index.js"

const getMessageByChatId = async (req, res, next)=>{
    try {
        const {chatId} = req.params
        const messages = await messageCollection.find({chatId : chatId})
        if(!messages){
            res.status(404).json({
                message: 'belum ada pesan'
            })
        }
        res.status(200).json({
            message: 'berhasil mengambil pesan chat',
            chat_message: messages
        })
    } catch (error) {
        next(error)
    }
}

const createMessage = async (req, res, next)=>{
    try {
        const {chatId, senderId, message} = req.body
        const newMessage = new messageCollection({
            chatId,
            senderId,
            message
        })

        await newMessage.save()
        // kirim pesan real-time ke room chat
        io.to(chatId).emit('receive_message', newMessage)
        res.status(201).json({
            message: 'pesan berhasil terkirim'
        })
    } catch (error) {
        next(error)
    }
}



export {getMessageByChatId, createMessage}