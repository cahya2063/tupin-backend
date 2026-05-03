import mongoose from "mongoose";
import jobsCollection from "../models/jobs.js";
import userCollection from "../models/users.js"
import { createNotification } from "./notification.js";
import axios from "axios";
import paymentCollection from "../models/payment.js";
import { createTransfer } from "./payment.js";


const ObjectId = mongoose.Types.ObjectId

const addJob = async (req, res) => { // client
  try {
    if (req.files.length > 10) {
      return res.status(400).json({
        message: "Maksimal upload 10 foto saja",
      });
    }else{

      const data = req.body;
      const newJob = {
        title: data.title,
        category: data.category,
        deadline: JSON.parse(data.deadline || "{}"), // kalau deadline dikirim json
        description: data.description,
        photos: req.files ? req.files.map(file => file.filename) : [], // ambil nama file
        location: JSON.parse(data.location || "{}"),
        selectedTechnician: data.selectedTechnician,
        destination: JSON.parse(data.destination || "{}"),
        idCreator: data.userId,
      };
     
      
  
      const result = await jobsCollection.create(newJob);
      const client = await userCollection.findById(data.userId);
      const technician = await userCollection.findById(data.selectedTechnician)
      const job = result;
      createNotification(job.idCreator, job.id, `berhasil mengunggah job baru dengan judul ${job.title}` )
  
      await axios.post(
        "https://api.fonnte.com/send",
        {
          target: "085964209070",
          message: `Halo ${technician.nama} 👋
            Ada permintaan servis baru:
  
            👤 Nama: ${client.nama}
            🔧 Kerusakan: ${newJob.title}
  
            Silakan cek aplikasi untuk detail lebih lanjut.`,
        },
        {
          headers: {
            Authorization: "S6j44GRdybrddbPrrdSj",
          },
        }
      );
      res.status(201).json({
        message: "berhasil menambah job",
        data: newJob,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getAllJob = async (req, res)=>{// teknisi
  try {
    const data = await jobsCollection.find({})
    res.status(200).json({
      'message': 'berhasil mengambil data',
      'jobs': data
    })
  } catch (error) {
    res.status(500).json({
      'message': 'gagal mengambil data'
    })
  }
}

const getDetailJob = async (req, res, next)=>{// teknisi, client
  try {
    const {id} = req.params
    const job = await jobsCollection.findOne({_id: new ObjectId(id)})
    if(!job){
      return res.status(404).json({message: 'Job tidak ditemukan'})
    }
    return res.status(200).json({
      'message': 'berhasil ambil data job',
      'job': job
    })
  } catch (error) {
    next(error)
  }
}

const getJobByUser = async (req, res, next)=>{ // client
  try {
    // const {userId} = req.params
    const userId = req.user.id
    const jobs = await jobsCollection.find({idCreator: userId})

    if(!jobs || jobs.length === 0){
      return res.status(404).json({
        message: 'Client belum pernah mengupload job'
      })
    }
    return res.status(200).json({
      message: 'Berhasil mengambil data job',
      jobs: jobs
    })
  } catch (error) {
    next(error)
  }
}

const getAcceptedJob = async(req, res, next)=>{// teknisi
  try {
    const technicianId = req.user.id
    const jobs = await jobsCollection.find({selectedTechnician: technicianId})
    
    jobs.forEach((job)=>{
      const payment = paymentCollection.findOne({
        jobId: job._id
      })
      // perbarui status job
      if(payment.status == 'PAID' && payment.type === 'transportation' && job.status == 'pending transport fee'){
        job.status = 'transport fee paid'
        job.save()
      }
    })
    // console.log('jobs : ', jobs);
    

    if(!jobs || jobs.length === 0){
      return res.status(404).json({
        message: 'tidak ada job yang diterima'
      })
    }
    
    return res.status(200).json({
      message: 'berhasil mengambil job',
      jobs
    })
  } catch (error) {
    next(error)
  }
}

const checkedJob = async(req, res, next)=>{
  try {
    const {jobId} = req.params
    
    const job = await jobsCollection.findOne({
      _id: jobId,
      status: 'transport fee paid'
    })
    const payment = await paymentCollection.findOne({
      jobId: job._id,
      type: 'transportation',
      status: 'PAID'
    })
    if(!payment){
      return res.status(400).json({
        message: 'transport fee belum dibayar'
      })
    }
    if(!job){
      return res.status(404).json({
        message: 'Job tidak ditemukan'
      })
    }

    await createTransfer(job._id, job.selectedTechnician, 'transportation')
    
    job.status = 'checked'
    await job.save()
    res.status(200).json({
      message: 'job sudah diperiksa oleh teknisi'
    })
  } catch (error) {
    next(error)
  }
}



const getJobHistory = async(req, res, next)=>{// client
  try {
    const {technicianId} = req.params
    const jobs = await jobsCollection.find({
      selectedTechnician: technicianId,
      status: 'completed'
    })

    
    if(jobs){
      return res.status(200).json({
        success: true,
        message: 'berhasil mengambil job history',
        jobs
      })
    }
    return res.status(404).json({
      success: false,
      message: 'tidak ada job history'
    })
  } catch (error) {
    next(error)
  }
}



const doneJob = async(req, res, next)=>{// teknisi
  const {jobId} = req.params
  const job = await jobsCollection.findOne({
    _id: jobId,
    status: 'repair paid'
  })

  if(!job){
    res.status(404).json({
      message: 'job tidak ditemukan'
    })
  }
  
  const technician = await userCollection.findById(job.selectedTechnician)
  const client = await userCollection.findById(job.idCreator)
  
  job.status = 'warranty'
  job.jobDoneDate = Date.now()
  job.save()

  // buat notifikasi client
  createNotification(client.id, jobId, `teknisi ${technician.nama} sudah menyelesaikan ${job.title} konfirmasi pada kami jika alatmu sudah selesai`)

  // buat notifikasi teknisi
  createNotification(technician.id, jobId, `tunggu client mengkonfirmasi jika ${job.title} sudah selesai`)

  res.status(200).json({
    message: 'berhasil menyelesaikan job'
  })
}

const claimWarranty = async(req, res, next)=>{
  try {
    const {jobId} = req.params
    console.log('jobId : ', jobId);
    
    const job = await jobsCollection.findOne({
      _id: jobId,
      status: 'warranty'
    })
    const client = await userCollection.findById(job.idCreator)
    
    if(!job){
      return res.status(404).json({
        message: 'job tidak ditemukan'
      })
    }
    await createTransfer(job._id, client._id, 'cashback')
    job.status = 'completed'
    job.isTransfered = true
    job.save()
    
    createNotification(client.id, jobId, `klaim garansi untuk ${job.title} berhasil, uang akan dikembalikan ke akun kamu`)
    return res.status(200).json({
      success: true,
      message: 'berhasil klaim garansi, uang akan dikembalikan ke akun kamu',
    })
  } catch (error) {
    next(error)
  }
}
const isJobCompleted = async(req, res, next)=>{// (server) tidak jadi
  try {
    const {jobId} = req.params
    const {status} = req.body
    console.log('status : ', req.body);
    
    const job = await jobsCollection.findOne({
      _id: jobId,
      status: 'warranty'
    })

    if(!job){
      res.status(404).json({
        message: 'job tidak ditemukan'
      })
    }

    const technician = await userCollection.findById(job.selectedTechnician)
    const client = await userCollection.findById(job.idCreator)
    
    if(status === 'uncompleted'){
      job.status = 'paid'
      job.save()
      //notifikasi ke teknisi
      createNotification(technician.id, jobId, `kata client kamu belum menyelesaikan pekerjaan ${job.title}`)

      //notifikasi ke client
      createNotification(client.id, jobId, `berhasil mengkonfirmasi bahwa alat belum selesai dan memberitahu teknisi ${technician.nama}`)

      return res.status(200).json({
        message: `berhasil mengkonfirmasi job ${job.title} belum selesai`
      })
    }
    else if(status === 'completed'){
      job.status = 'completed'
      job.save()

      await createTransfer(job._id, technician._id, 'payment')

      // notifikasi ke teknisi
      createNotification(technician.id, jobId, `selamat pekerjaanmu pada ${job.title} telah selesai dan dikonfirmasi oleh client ${client.nama}`)

      // notifikasi ke client
      createNotification(client.id, jobId, `berhasil mengkonfirmasi job selesai dan memberi tahu teknisi ${technician.nama}`)

      res.status(200).json({
        message: 'berhasil mengkonfirmasi job selesai'
      })
    }
    else{
      res.status(400).json({
        message: 'request status tidak valid'
      })
    }
  } catch (error) {
    next(error)
  }
  
}
const cancelJobs = async (req, res, next)=>{// teknisi, client
  try {
    
    const {jobId} = req.params
    const job = await jobsCollection.findById(jobId)
    if(!job){
      return res.status(404).json({
        message: 'data job tidak ditemukan'
      })
    }

    if(!job.selectedTechnician){
      
      return res.status(400).json({
        message: 'job ini belum memilih teknisi',
      })
    }
    
    job.status = 'canceled'
    await job.save()

    return res.status(200).json({
      message: 'berhasil cancel job'
    })
  } catch (error) {
    next(error)
  }
  
}

export {
  addJob, 
  getAllJob, 
  getDetailJob, 
  getJobHistory,
  checkedJob,
  // addPriceToJob,
  // applyJob, 
  getJobByUser, 
  // chooseTechnician, 
  getAcceptedJob, 
  // technicianRequest, 
  // approveJobRequest,
  doneJob,
  claimWarranty,
  isJobCompleted,
  cancelJobs
}