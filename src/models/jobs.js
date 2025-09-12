import mongoos from "../utils/db.js";

const jobsSchema = new mongoos.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    skills: {
        type: Array,
        required: false
    },
    scoped: {
        type: String,
        required: false
    },
    deadline: {
        type: String,
        required: false
    },
    experiences: {
        type: String,
        required: false
    },
    budget: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: false
    },
    invites: {
        type: Array,
        required: true
    }
})

const jobsCollection = mongoos.model('jobs', jobsSchema)
export default jobsCollection


