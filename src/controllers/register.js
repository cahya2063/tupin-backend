import userCollection from '../models/users.js';
import { createSubAccountRequest } from '../services/xendit.service.js';
import { encrypt } from '../utils/bcrypt.js';
import registerValidation from '../validation/register.js';
import { sendActivationEmail, sendEmailRegistrationFirstStep, sendRejectTechnicianEmail } from './notification.js';
import crypto from 'crypto'
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
  return res.status(201).json({
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
    return res.status(201).json({
      message: 'pendaftaran berhasil tunggu email dari kami ya!!'
    })
  } catch (error) {
    next(error)
    
  }
}

const approveTechnician = async(req, res, next)=>{// admin
  try {
    
    const {technicianId} = req.params
    const activationToken = crypto.randomBytes(32).toString('hex')
    const technician = await userCollection.findOne({
      _id: technicianId
    })
    
    if (!technician) {
      return res.status(404).json({
        message: 'Teknisi tidak ditemukan'
      })
    }
    const subAccount = {
      email : technician.email,
      type: 'OWNED',
      business_name: technician.nama
    }
    await createSubAccountRequest(subAccount)
    
  
    technician.status = 'approve'
    technician.activationToken = activationToken
    technician.activationExpired = Date.now() + 1000 * 60 * 60 * 24 * 3 // 3 hari
    await technician.save()

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const activationLink =`${frontendUrl}/technician/activate?token=${activationToken}`;
    await sendActivationEmail('cronosstar007@gmail.com', activationLink);

    return res.status(200).json({
      success: true,
      message: 'Teknisi berhasil disetujui dan email aktivasi telah dikirim'
    })
  } catch (error) {
    next(error)
  }
}

const rejectTechnician = async(req, res, next)=>{
  try {
    const {technicianId} = req.params
    const technician = await userCollection.findOne({
      _id: technicianId,
      status: 'pending'
    })

    if(!technician){
      return res.status(404).json({
        success: false,
        message: 'teknisi belum terdaftar'
      })
    }

    technician.status = 'rejected'
    technician.save()
    sendRejectTechnicianEmail('cronosstar007@gmail.com')

    return res.status(200).json({
      message: `berhasil menolak teknisi ${technician.nama}`
    })
  } catch (error) {
    next(error)
  }
}

const activateTechnician = async (req, res, next) => {// technician
  try {
    const { token, password } = req.body
    const newPassword = String(password || '')

    if (!token) {
      return res.status(400).json({
        message: 'Token aktivasi wajib dikirim'
      })
    }


    const technician = await userCollection.findOne({
      activationToken: token,
      role: 'technician'
    })

    if (!technician) {
      return res.status(400).json({
        message: 'Token aktivasi tidak valid'
      })
    }

    if (technician.activationExpired && new Date(technician.activationExpired).getTime() < Date.now()) {
      return res.status(400).json({
        message: 'Token aktivasi sudah kedaluwarsa'
      })
    }

    technician.password = await encrypt(newPassword)
    technician.activationToken = undefined
    technician.activationExpired = undefined
    technician.status = 'approve'

    await technician.save()

    return res.status(200).json({
      message: 'Password teknisi berhasil dibuat'
    })
  } catch (error) {
    next(error)
  }
}

export { 
  postSignupClient, 
  signupTechncianFirstStep, 
  approveTechnician, 
  activateTechnician, 
  rejectTechnician 
};
