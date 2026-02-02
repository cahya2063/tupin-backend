import userCollection from '../models/users.js';
import { createSubAccountRequest } from '../services/xendit.service.js';
import { encrypt } from '../utils/bcrypt.js';
import registerValidation from '../validation/register.js';
import { createSplitRule } from './payment.js';

const postSignupClient = async (req, res) => {// client, teknisi
  const validasi = registerValidation(req.body);
  if (validasi?.status === false) {
    return res.status(400).json({
      message: validasi.message,
    });
  }

  const isRegistered = await userCollection.findOne({
    email: validasi.data.email,
  });

  if (isRegistered) {
    return res.status(400).json({
      message: 'email sudah terdaftar',
    });
  }

  const newUser = {
    nama: validasi.data.nama,
    email: validasi.data.email,
    password: await encrypt(String(validasi.data.password)),
  };

  // untuk menyimpan ke database
  await userCollection.insertMany([newUser]);
  res.status(201).json({
    message: 'registrasi berhasil',
  });
};

const postSignupTechncian = async (req, res)=>{
  try {
    const validasi = registerValidation(req.body);
    if (validasi?.status === false) {
      return res.status(400).json({
        message: validasi.message,
      });
    }

    const isRegistered = await userCollection.findOne({
      email: validasi.data.email,
    });

    if (isRegistered) {
      return res.status(400).json({
        message: 'email sudah terdaftar',
      });
    }

    const newUser = {
      nama: validasi.data.nama,
      email: validasi.data.email,
      password: await encrypt(String(validasi.data.password)),
    };

    const technicianSubAccount = await createSubAccountRequest({
      type: 'MANAGED',
      business_email: validasi.data.email,
      business_name: validasi.data.nama,
    })

    const splitRule = await createSplitRule(technicianSubAccount.id)
    
    newUser.subAccountId = technicianSubAccount.id;
    newUser.split_rule_id = splitRule.id
    newUser.role = 'technician'
    // untuk menyimpan ke database
    await userCollection.insertMany([newUser]);
    res.status(201).json({
      message: 'registrasi teknisi berhasil',
    });
  } catch (error) {
    console.log('error: ', error);
    
  }
  
  
}
export { postSignupClient, postSignupTechncian };
