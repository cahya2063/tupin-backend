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

    res.status(200).json({
      message: "berhasil menambah job",
      data: newJob,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {addJob, getAllJob, getDetailJob}






