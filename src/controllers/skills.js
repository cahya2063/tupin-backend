import SkillCollection from "../models/skills.js"

const createSkills = async(req, res, next)=>{
    try {
        const {data} = req.body
        await SkillCollection.create(data)
        return res.status(200).json({
            success: true,
            message: 'berhasil menambah skill baru'
        })
    } catch (error) {
        next(error)
    }
}
const updateSkills = async(req, res,next)=>{
    try {
        const {skillId} = req.params
        const {label} = req.body
        const skill = await SkillCollection.findByIdAndUpdate(
            skillId,
            { label },
            { new: true, runValidators: true }
        )

        if (!skill) {
            return res.status(404).json({
                message: 'Skill tidak ditemukan'
            })
        }

        return res.status(200).json({
            message: 'Skill berhasil diupdate',
            data: skill
        })
    } catch (error) {
        next(error)
    }
}

const deleteSkills = async(req, res, next)=>{
    try {
        const {skillId} = req.params
        const deletedSkill = await SkillCollection.findByIdAndDelete(skillId)

        return res.status(200).json({
            success: true,
            message: 'berhasil hapus skill'
        })
    } catch (error) {
        next(error)
    }
}
const getAllSkills = async(req, res, next)=>{// client
    try {
        const data = await SkillCollection.find({})
        return res.status(200).json({
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
        return res.status(200).json({
            success: true,
            skill
        })
    } catch (error) {
        next(error)
    }
}

export {getAllSkills, getSkillById, createSkills, updateSkills, deleteSkills}