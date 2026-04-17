import SkillCollection from "../models/skills.js"

const getAllSkills = async(req, res, next)=>{// client
    try {
        const data = await SkillCollection.find({})
        res.status(200).json({
            'message': 'berhasil mengambil data',
            'skills': data
        })
    } catch (error) {
        next(error)
    }
}
const getSkillById = async(req, res, next)=>{
    const {id} = req.params
    try {
        const skill = await SkillCollection.findById(id)
        res.status(200).json({
            success: true,
            skill
        })
    } catch (error) {
        next(error)
    }
}

export {getAllSkills, getSkillById}