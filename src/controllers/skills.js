import SkillCollection from "../models/skills.js"

const getAllSkills = async(req, res, next)=>{// client
    try {
        const data = await SkillCollection.find({})
        res.status(200).json({
            'message': 'berhasil mengambil data',
            'skills': data
        })
    } catch (error) {
        res.status(500).json({
            'message': 'gagal mengambil data'
        })
    }
}

export {getAllSkills}