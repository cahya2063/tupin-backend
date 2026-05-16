import jobsCollection from "../models/jobs.js"
import reportsCollection from "../models/reports.js"
import userCollection from "../models/users.js"

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

        return res.status(201).json({
            success: true,
            message : 'berhasil mengajukan laporan'
        })
    } catch (error) {
        next(error)
    }
}

const getAllReports = async(req, res, next)=>{ // admin
    try {
        const reports = await reportsCollection.find({})

        const jobIds = reports.map(report => report.jobId)

        const jobs = await jobsCollection.find({
            _id: {$in: jobIds}
        })

        if(!reports || !jobs){
            return res.status(200).json({
                success: true,
                reports: [],
                jobs: []
            })    
        }
        return res.status(200).json({
            success: true,
            reports: reports,
            jobs: jobs
        })
    } catch (error) {
        next(error)
    }
}

const getReportsByJobId = async(req, res, next)=>{ // client || technician
    try {
        const {jobId} = req.params

        const job = await jobsCollection.findOne({
            _id: jobId
        })

        if(!job){
            return res.status(404).json({
                success: false,
                message: 'data job tidak ditemukan'
            })
        }

        const reports = await reportsCollection.findOne({
            jobId: job._id
        })

        return res.status(200).json({
            success: true,
            reports: reports
        })
    } catch (error) {
        next(error)
    }
}

const getReportsByUserId = async(req, res, next)=>{ // client
    try {
        const {userId} = req.params
        const jobs = await jobsCollection.find({
            $or: [
                {selectedTechnician: userId},
                {idCreator: userId}
            ],
        })

        const jobIds = jobs.map(job => job._id)

        const reports = await reportsCollection.find({
            jobId: {$in: jobIds}
        })
        if (reports.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'data report tidak ditemukan',
                reports: [],
                jobs: []
            })
        }

        return res.status(200).json({
            success: true,
            reports: reports,
            jobs: jobs
        })
    } catch (error) {
        next(error)
    }
}

const getReportsByTechnicianId = async(req, res, next)=>{
    try {
        const {technicianId} = req.params
        
        const reports = await reportsCollection.find({
            technicianId: technicianId
        })

        
        const jobIds = reports.map(rep => rep.jobId)

        const jobs = await jobsCollection.find({
            _id: {$in: jobIds}
        })

        if(reports.length == 0){
            return res.status(404).json({
                success: false,
                message: 'data report tidak ditemukan',
                reports: [],
                jobs: []
            })
        }        

        return res.status(200).json({
            success: true,
            reports: reports,
            jobs: jobs
        })
    } catch (error) {
        next(error)
    }
}

const approveReport = async(req, res, next)=>{ // admin
    try {
        const {reportId} = req.params
        const {adminNote, point} = req.body

        
        const report = await reportsCollection.findOne({
            _id: reportId
        })
        const technician = await userCollection.findOne({
            _id: report.technicianId
        })

        report.adminNote = adminNote
        report.point = point
        report.status = 'resolved'
        await report.save()

        technician.penaltyPoint += report.point
        await technician.save()

        return res.status(200).json({
            success: true,
            message: 'Berhasil menyetujui report pelanggan'
        })
        
    } catch (error) {
        next(error)
    }
}

const rejectReport = async(req, res, next)=>{
    try {
        const {reportId} = req.params
        const {adminNote, point} = req.body

        const report = await reportsCollection.findOne({
            _id: reportId
        })

        report.adminNote = adminNote
        report.point = point
        report.status = 'rejected'
        await report.save()

        return res.status(200).json({
            success: true,
            message: 'Berhasil menolak report pelanggan'
        })
    } catch (error) {
        next(error)
    }
}

const disableTechnician = async(req, res, next)=>{
    try {
        const {technicianId} = req.params
    
        const technician = await userCollection.findOne({
            _id: technicianId
        })
        
        if(!technician){
            return res.status(404).json({
                success: false,
                message: 'teknisi tidak ditemukan'
            })
        }

        technician.isActive = false
        await technician.save()
        return res.status(201).json({
            success: true,
            message: 'berhasil nonaktifkan teknisi'
        })

        
    } catch (error) {
        next(error)
    }

}

export {
    addReports,
    getAllReports,
    getReportsByJobId,
    getReportsByUserId,
    getReportsByTechnicianId,
    approveReport,
    rejectReport,
    disableTechnician
}
