import chatCollection from "../models/chats.js";
import messageCollection from "../models/messages.js";

const createChat = async (req, res, next)=>{// teknisi, client
    try {
        const {clientId, technicianId} = req.body;

        let isChatExist = await chatCollection.findOne({clientId, technicianId, status: 'open'})
        if(isChatExist){
            return res.status(200).json({
                message: 'chat sudah ada',
                chat: isChatExist
            })
        }

        const chat = new chatCollection({
            clientId: clientId,
            technicianId: technicianId
        })
        await chat.save()
        return res.status(201).json({
            message: 'chat berhasil dibuat',
        })
    } catch (error) {
        next(error)
    }
}

const getChatByUserId = async (req, res, next)=>{// teknisi, client
    try {
        const { userId } = req.params;
        const chats = await chatCollection.find({ $or: [{ clientId: userId }, { technicianId: userId }] });
        const chatsWithUnread = await Promise.all(
            chats.map(async chat => {
            const unreadMessages = await messageCollection.countDocuments({
                chatId: chat._id,
                receiverId: userId,
                isRead: false
            })

            return {
                ...chat.toObject(),
                unreadMessages
            }
            })
        )

        return res.status(200).json({
            message: 'chats berhasil diambil',
            chats: chatsWithUnread
        })
    } catch (error) {
        next(error)
    }
}

export { createChat, getChatByUserId }
