import chatCollection from "../models/chats.js";

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
        res.status(201).json({
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
        res.status(200).json({
            message: 'chats berhasil di ambil',
            chats: chats
        });
    } catch (error) {
        next(error)
    }
}

export { createChat, getChatByUserId }
