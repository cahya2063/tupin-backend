import jobsCollection from "../models/jobs.js"
import reportsCollection from "../models/reports.js"

const addReports = async(req, res, next)=>{ // client
    try {
        const {jobId} = req.params
        const {category, description} = req.body
        const jobs = await jobsCollection.findById(jobId)

        if(!jobs){
            return res.status(404).json({
                success: false,
                message: 'data job tidak ditemukan'
            })
        }

        await reportsCollection.create({
            jobId: jobs._id,
            technicianId: jobs.selectedTechnician,
            category: category,
            description: description,
            reportImage: req.files ? req.files.map(file => file.filename) : [], // ambil nama file
            createdAt: Date.now()
        })

        res.status(201).json({
            success: true,
            message : 'berhasil mengajukan laporan'
        })
    } catch (error) {
        next(error)
    }
}


export {
    addReports
}
