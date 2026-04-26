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
    price: {
        type: Number,
        required: false
    },
    description: {
        type: String,
        required: true
    },
    photos: {
        type: Array,
        required: false
    },
    location: {
        type: Object,
        required: true
    },
    destination: {
        type: Object,
        required: true
    },
    selectedTechnician: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['open', 'pending transport fee', 'transport fee paid', 'checked', 'pending repair payment', 'repair paid', 'done', 'completed', 'canceled'],
        default: 'open'
    },
    idCreator: {
        type: String,
        required: true
    }
})

const jobsCollection = mongoos.model('jobs', jobsSchema)
export default jobsCollection


