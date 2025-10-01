import chatCollection from "../models/chats.js";

const createChat = async (req, res, next)=>{
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
    } catch (error) {
        next(error)
    }
}

export { createChat }
