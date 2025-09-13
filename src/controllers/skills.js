import SkillCollection from "../models/skills.js"

const getAllSkills = async(req, res, next)=>{
    try {
        const data = await SkillCollection.find({})
        res.status(200).json({
            'message': 'berhasil mengambil data',
            'skills': data
        })
    } catch (error) {
        
    }
}

export {getAllSkills}