import userCollection from '../models/users.js';
import { createSubAccountRequest } from '../services/xendit.service.js';
import { encrypt } from '../utils/bcrypt.js';
import registerValidation from '../validation/register.js';
import { sendEmailRegistrationFirstStep } from './notification.js';
// import { createSplitRule } from './payment.js';

const postSignupClient = async (req, res) => {// client
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

const signupTechncianFirstStep = async (req, res, next)=>{ // technician
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

    const newTechnician = {
      nama: validasi.data.nama,
      email: validasi.data.email,
      phone_number: validasi.data.phone_number,
      city: validasi.data.city,

      skills: validasi.data.skills,
      description: validasi.data.description,

      role: 'technician',
      status: 'pending',
      ratings: 0,
    }
    await userCollection.insertOne(newTechnician)
    await sendEmailRegistrationFirstStep('cronosstar007@gmail.com')
    res.status(201).json({
      message: 'pendaftaran berhasil tunggu email dari kami ya!!'
    })
  } catch (error) {
    next(error)
    
  }
}

const signUpTechnicianVerification = async(req, res, next)=>{

}

export { postSignupClient, signupTechncianFirstStep };
