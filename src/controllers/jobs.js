import jobsCollection from "../models/jobs.js";

const addJob = async (req, res)=>{

    const data = req.body
    const newJob = {
        title: data.title,
        category: data.category,
        skills: data.skills,
        scoped: data.scoped,
        deadline: data.deadline,
        experiences: data.experiences,
        budget: data.budget,
        description: data.description,
        photo: data.photo,
        invites: data.invites
    }

    await jobsCollection.insertMany([newJob])

    res.status(200).json({
        'message': 'berhasil menambah job',
        'data': newJob
    })
}

export {addJob}






