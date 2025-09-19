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
    required: true,
  },
  phone_number: {
    type: Number,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  zip_code: {
    type: Number,
    required: false,
  },
  avatar: {
    type: String,   // simpan path atau filename
    required: false,
  },
  role: {
    type: String,
    enum: ['technician', 'client', 'admin'], // daftar role yg valid
    default: 'client',                     // default role
  },
});

const userCollection = mongoos.model('users', logInSchema);

export default userCollection;
