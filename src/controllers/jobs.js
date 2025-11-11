import mongoose from "mongoose";
import jobsCollection from "../models/jobs.js";
import notificationCollection from "../models/notification.js";
import userCollection from "../models/users.js"
import { createNotification } from "./notification.js";

const ObjectId = mongoose.Types.ObjectId

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
    const {userId} = req.params
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
    const {technicianId} = req.params
    const jobs = await jobsCollection.find({selectedTechnician: technicianId})
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


const addJob = async (req, res) => { // client
  try {
    const data = req.body;
    const newJob = {
      title: data.title,
      category: data.category,
      skills: JSON.parse(data.skills || "[]"), // kalau skills dikirim array/stringify
      scoped: data.scoped,
      deadline: JSON.parse(data.deadline || "{}"), // kalau deadline dikirim json
      experiences: data.experiences,
      budget: data.budget,
      description: data.description,
      photo: req.file ? req.file.filename : null, // ambil nama file
      invites: JSON.parse(data.invites || "[]"),
      idCreator: data.userId
    };

    const result = await jobsCollection.insertMany([newJob]);
    const job = result[0];
    createNotification(job.idCreator, job.id, `berhasil mengunggah job baru dengan judul ${job.title}` )

    res.status(201).json({
      message: "berhasil menambah job",
      data: newJob,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const applyJob = async (req, res, next) => { // technician
  try {
    const { jobId } = req.params;
    const { userId } = req.body;
    console.log('jobId:', jobId, 'userId:', userId);
    

    if (!userId) {
      return res.status(400).json({ message: "userId wajib dikirim" });
    }

    // update job dengan push userId ke array invites
    const updatedJob = await jobsCollection.findByIdAndUpdate(
      jobId,
      { $addToSet: { invites: userId } }, // $addToSet agar tidak duplikat
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ message: "Job tidak ditemukan" });
    }

    return res.status(201).json({
      message: "Berhasil apply job",
      job: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

const chooseTechnician = async (req, res, next) => {// client
  try {
    const { jobId } = req.params;
    let { technicianId } = req.body;

    // kalau technicianId dikirim string dengan tanda kutip, hapus kutipnya
    if (typeof technicianId === "string") {
      technicianId = technicianId.replace(/"/g, "");
    }

    // cek apakah job ada
    const job = await jobsCollection.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job tidak ditemukan" });
    }

    // cek apakah teknisi memang apply
    const alreadyApplied = job.invites.some(
      (id) => id.toString() === technicianId
    );
    if (!alreadyApplied) {
      return res.status(400).json({ message: "Teknisi ini belum apply" });
    }

    // update job
    job.selectedTechnician = technicianId;
    job.status = "pending";
    await job.save();

    // buat notifikasi
    createNotification(technicianId, jobId, `Anda terpilih untuk mengerjakan job "${job.title}"`)

    return res.status(200).json({
      message: "Berhasil memilih teknisi dan mengirim notifikasi",
    });
  } catch (error) {
    console.error("❌ Error simpan notifikasi:", error);
    next(error);
  }
};

const technicianRequest = async(req, res, next)=>{// teknisi
  try {
    
    const {jobId} = req.params    
    const job = await jobsCollection.findOne({
      _id: jobId,
      status: 'pending'
    })
    if (!job) {
      res.status(404).json({
        message: 'data jobs tidak ditemukan'
      })
    }
    const technician = await userCollection.findById(job.selectedTechnician)
    const client = await userCollection.findById(job.idCreator)

    job.status = 'request'
    job.save()

    // buat notifikasi client
    createNotification(client.id, jobId, `teknisi ${technician.nama} mengajukan request perbaikan pada ${job.title}`)

    // buat notifikasi teknisi
    createNotification(technician.id, jobId, `berhasil mengirim request perbaikan ke ${client.nama} tunggu konfirmasinya!`)

    res.status(200).json({
      message: 'berhasil mengajukan request'
    })
  } catch (error) {
    next(error)
  }
}

const approveJobRequest = async(req, res, next)=>{// client
  const {jobId} = req.params
  const job = await jobsCollection.findOne({
    _id: jobId,
    status: 'request'
  })

  if(!job){
    res.status(404).json({
      message: 'job tidak ditemukan'
    })
  }
  const technician = await userCollection.findById(job.selectedTechnician)
  const client = await userCollection.findById(job.idCreator)

  job.status = 'progress'
  job.save()

    // buat notifikasi client
    createNotification(client.id, jobId, `berhasil menyetujui ${technician.nama} untuk mengerjakan ${job.title}`)

    // buat notifikasi teknisi
    createNotification(technician.id, jobId, `selamat client ${client.nama} menyetujui request perbaikanmu! kamu sudah bisa mulai memperbaiki ${job.title}`)

    res.status(200).json({
      message: 'berhasil menyetujui request'
    })
}

const doneJob = async(req, res, next)=>{// teknisi
  const {jobId} = req.params
  const job = await jobsCollection.findOne({
    _id: jobId,
    status: 'progress'
  })

  if(!job){
    res.status(404).json({
      message: 'job tidak ditemukan'
    })
  }

  const technician = await userCollection.findById(job.selectedTechnician)
  const client = await userCollection.findById(job.idCreator)

  job.status = 'done'
  job.save()

  // buat notifikasi client
  createNotification(client.id, jobId, `teknisi ${technician.nama} sudah menyelesaikan ${job.title} konfirmasi pada kami jika alatmu sudah selesai`)

    // buat notifikasi teknisi
    createNotification(technician.id, jobId, `tunggu client mengkonfirmasi jika ${job.title} sudah selesai`)

    res.status(200).json({
      message: 'berhasil menyelesaikan job'
    })
}
const isJobCompleted = async(req, res, next)=>{// client
  try {
    const {jobId} = req.params
    const {status} = req.body
    const job = await jobsCollection.findOne({
      _id: jobId,
      status: 'done'
    })

    if(!job){
      res.status(404).json({
        message: 'job tidak ditemukan'
      })
    }

    const technician = await userCollection.findById(job.selectedTechnician)
    const client = await userCollection.findById(job.idCreator)
    
    if(status === 'uncompleted'){
      job.status = 'progress'
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
    

    // const technicianId = job.selectedTechnician
    // const clientId = job.idCreator

    job.status = 'open'
    job.selectedTechnician = null
    await job.save()

    // const chat = await chatCollection.findOneAndDelete({
    //   clientId: clientId,
    //   technicianId: technicianId
    // })

    // if(chat){
    //   await messageCollection.deleteMany({
    //     chatId: chat._id
    //   })
    // }

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
  applyJob, 
  getJobByUser, 
  chooseTechnician, 
  getAcceptedJob, 
  technicianRequest, 
  approveJobRequest,
  doneJob,
  isJobCompleted,
  cancelJobs
}






