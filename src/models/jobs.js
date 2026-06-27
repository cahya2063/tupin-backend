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
    size: {
        type: String,
        required: true
    },
    selectedTechnician: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['open', 'pending transport fee', 'transport fee paid', 'checked', 'pending repair payment', 'repair paid', 'warranty', 'completed', 'canceled'],
        default: 'open'
    },
    jobDoneDate: {
        type: Date,
        required: false
    },
    idCreator: {
        type: String,
        required: true
    },
    transferStatus: {
        transportation: {
            type: Boolean,
            default: false
        },
        repair: {
            type: Boolean,
            default: false
        }
    },
    jobCancel: {
        cancelBy: {
            type: String,
            required: false
        },
        category: {
            type: String,
            enum: [
                // teknisi
                'skill_mismatch',
                'distance_too_far',
                'not_available',
                'negotiation_failed',
                'client_unresponsive',
                
                // client
                'price_too_high',
                'changed_mind_after_inspection' // berubah pikiran
            ],
            required: false
        },
        note: {
            type: String,
            required: false
        },
        canceledAt: {
            type: Date,
            required: false
        }
    },
    moderation: {
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedBy: {
            type: String,
            required: false
        },
        deletedReason: {
            type: String,
            enum: [
                'postingan spam',
                'konten tidak pantas',
                'upload foto aneh',
                'bukan konteks perbaikan',
            ],
            required: false
        },

        deletedNote: {
            type: String,
            required: false
        },

        deletedAt: {
            type: Date,
            required: false
        }
    }
})

const jobsCollection = mongoos.model('jobs', jobsSchema)
export default jobsCollection


