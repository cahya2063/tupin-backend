import { type } from 'os';
import mongoos from '../utils/db.js';

const logInSchema = new mongoos.Schema({
  nama: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  phone_number: {
    type: Number,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  subdistrict:{
    type: String,
    required: false
  },
  village: {
    type: String,
    required: false,
  },
  zip_code: {
    type: Number,
    required: false,
  },
  receiverLocation:{
    type: Object,
    required: false
  },
  skills: {
    type: Array,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  ratings: {
    type: Number,
    required: false,
    default: 0
  },
  avatar: {
    type: String,   // simpan path atau filename
    required: false,
  },
  subAccountId: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ['technician', 'client', 'admin'], 
    default: 'client',                     
  },
  status: { // technician
    type: String,
    enum: ['pending', 'approve', 'rejected'],
    default: 'pending'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  identityCard:{
    type: String,
    required: false
  },
  selfieWithIdentityCard:{
    type: String,
    required: false
  },
  activationToken: {
    type: String,
    required: false
  },
  activationExpired: {
    type: Date,
    required: false
  },
  penaltyPoint: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }

});

const userCollection = mongoos.model('users', logInSchema);

export default userCollection;
