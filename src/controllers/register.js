import userCollection from '../models/users.js';
import { encrypt } from '../utils/bcrypt.js';
import registerValidation from '../validation/register.js';

const postSignup = async (req, res) => {// client, teknisi
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

export { postSignup };
