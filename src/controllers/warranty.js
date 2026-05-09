import jobsCollection from "../models/jobs.js";
import userCollection from "../models/users.js";
import warrantyCollection from "../models/warranty.js";
import { emitToJobParties } from "../utils/tools.js";
import { createNotification } from "./notification.js";
import { createTransfer } from "./payment.js";

// const claimWarranty = async(req, res, next)=>{
//   try {
//     const {jobId} = req.params
//     console.log('jobId : ', jobId);
    
//     const job = await jobsCollection.findOne({
//       _id: jobId,
//       status: 'warranty'
//     })
//     const client = await userCollection.findById(job.idCreator)
    
//     if(!job){
//       return res.status(404).json({
//         message: 'job tidak ditemukan'
//       })
//     }
//     await createTransfer(job._id, client._id, 'cashback')
//     job.status = 'completed'
//     job.isTransfered = true
//     job.save()
    
//     createNotification(client.id, jobId, `klaim garansi untuk ${job.title} berhasil, uang akan dikembalikan ke akun kamu`)
//     return res.status(200).json({
//       success: true,
//       message: 'berhasil klaim garansi, uang akan dikembalikan ke akun kamu',
//     })
//   } catch (error) {
//     next(error)
//   }
// }

const createWarranty = async(req, res, next)=>{
    try {
        if (req.files.length > 10) {
            return res.status(400).json({
                message: "Maksimal upload 10 foto saja",
            });
        }else{

            const data = req.body;
            const newWarranty = {
                jobId: data.jobId,
                reason: data.reason,
                evidence: req.files ? req.files.map(file => file.filename) : [], // ambil nama file
            };

            const addWarranty = await warrantyCollection.create(newWarranty)
            const job = await jobsCollection.findOne({
                _id: newWarranty.jobId
            })
            job.status = 'completed'
            await job.save()
            emitToJobParties('job:completed', job, {
                jobId: job._id,
                status: job.status
            })
            // notifikasi ke pelanggan
            createNotification(job.idCreator, job._id, `berhasil mengajukan ke job ${job.title}`)

            if(addWarranty){

                res.status(201).json({
                    message: "berhasil mengajukan garansi",
                });
            }
        }
    } catch (error) {
        next(error)
        
    }
}

const getWarranties = async(req, res, next)=>{
    try {
        const userId = req.user.id
        console.log('user warranties : ', userId);
        
        const jobs = await jobsCollection.find({
            $or: [
                {selectedTechnician: userId},
                {idCreator: userId}
                ],
                status: 'completed'
            })

            const jobIds = jobs.map(job => job._id)
        
            const warranties = await warrantyCollection.find({
                jobId: {$in: jobIds}
            })

            res.status(200).json({
                success: true,
                warranties: warranties,
                jobs: jobs
            })
    } catch (error) {
        next(error)
    }
}

const approveWarranties = async(req, res, next)=>{
    const {warrantyId} = req.params
    const warranty = await warrantyCollection.findOne({
        _id: warrantyId
    })
    const job = await jobsCollection.findOne({
        _id: warranty.jobId
    })
    if(!warranty){
        res.status(404).json({
            success: false,
            message: 'data garansi tidak ditemukan'
        })
    }
    warranty.status = 'repairing'
    warranty.save()
    emitToJobParties('warranty:approve', job, {
      warrantyId: warranty._id,
      status: warranty.status
    })
    res.status(200).json({
        success: true,
        message: "berhasil menerima garansi"
    })
}

const doneWarranty = async(req, res, next)=>{
    const {warrantyId} = req.params
    const warranty = await warrantyCollection.findOne({
        _id: warrantyId
    })
    const job = await jobsCollection.findOne({
        _id: warranty.jobId
    })
    if(!warranty){
        res.status(404).json({
            success: false,
            message: 'data garansi tidak ditemukan'
        })
    }
    warranty.status = 'done'
    warranty.save()
    await createTransfer(job._id, job.selectedTechnician, 'transfer')
    emitToJobParties('warranty:done', job, {
      warrantyId: warranty._id,
      status: warranty.status
    })
}
const rejectWarranty = async(req, res, next)=>{
    const {warrantyId} = req.params
    console.log('reject warranties : ', warrantyId);
    
    const warranty = await warrantyCollection.findOne({
        _id: warrantyId
    })
    const job = await jobsCollection.findOne({
        _id: warranty.jobId
    })
    if(!warranty){
        res.status(404).json({
            success: false,
            message: 'data garansi tidak ditemukan'
        })
    }
    warranty.status = 'rejected'
    warranty.save()
    await createTransfer(job._id, job.idCreator, 'transfer')
    emitToJobParties('warranty:reject', job, {
      warrantyId: warranty._id,
      status: warranty.status
    })
}
export {
    // claimWarranty,
    createWarranty,
    getWarranties,
    approveWarranties,
    doneWarranty,
    rejectWarranty
}