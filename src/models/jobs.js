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

    deadline: {
        type: Object,
        required: false
    },

    description: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: false
    },
    location: {
        type: Object,
        required: true
    },
    selectedTechnician: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['open', 'pending', 'request', 'progress', 'done', 'completed', 'payed', 'payed done', 'canceled'],
        default: 'open'
    },
    idCreator: {
        type: String,
        required: true
    }
})

const jobsCollection = mongoos.model('jobs', jobsSchema)
export default jobsCollection


