import mongoos from "../utils/db.js";

const reportsSchema = new mongoos.Schema({
    jobId :{
        type: String,
        required: true
    },
    technicianId: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: [
            'Hasil tidak sesuai',
            'Penipuan',  // lost contact
            'Pencurian', // barang tidak dikembalikan
            'Lainnya'
        ],
        default: 'Penipuan'
    },
    description: {
        type: String,
        required: false
    },
    reportImage: {
        type: Array,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'resolved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        required: true
    }
})

const reportsCollection = mongoos.model('reports', reportsSchema)
export default reportsCollection
