import mongoose from "mongoose";
import jobsCollection from "../models/jobs.js";
const ObjectId = mongoose.Types.ObjectId

const getAllJob = async (req, res)=>{
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

const getDetailJob = async (req, res, next)=>{
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

const getJobByUser = async (req, res, next)=>{
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


const addJob = async (req, res) => {
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

    await jobsCollection.insertMany([newJob]);

    res.status(201).json({
      message: "berhasil menambah job",
      data: newJob,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const applyJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;        // ambil id job dari URL
    const { userId } = req.body;         // ambil id user dari body (atau req.user dari authMiddleware)
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

export {addJob, getAllJob, getDetailJob, applyJob, getJobByUser}






