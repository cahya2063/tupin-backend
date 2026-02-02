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
    enum: ['technician', 'client', 'admin'], // daftar role yg valid
    default: 'client',                     // default role
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
  split_rule_id: {
    type: String,
    required: false
  },
  bank_name: {
    type: String,
    required: false
  },
  account_number: {
    type: String,
    required: false
  }
});

const userCollection = mongoos.model('users', logInSchema);

export default userCollection;
