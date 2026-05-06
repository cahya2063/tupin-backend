import validator from 'validator'

const sanitize = (data) => {
  return {
    nama: validator.escape(validator.trim(String(data.nama || ''))),
    email: validator.normalizeEmail(validator.trim(String(data.email || ''))),
    phone_number: validator.trim(String(data.phone_number || '')),
    city: validator.escape(validator.trim(String(data.city || ''))),
    description: validator.escape(validator.trim(String(data.description || ''))),
    skills: Array.isArray(data.skills) ? data.skills : []
  }
}

const registerValidation = (dt) => {
  const data = sanitize(dt)

  // NAMA
  if (validator.isEmpty(data.nama)) {
    return {
      status: false,
      message: 'Nama wajib diisi'
    }
  }

  if (!validator.isLength(data.nama, { min: 3 })) {
    return {
      status: false,
      message: 'Nama minimal 3 karakter'
    }
  }

  // EMAIL
  if (validator.isEmpty(data.email)) {
    return {
      status: false,
      message: 'Email wajib diisi'
    }
  }

  if (!validator.isEmail(data.email)) {
    return {
      status: false,
      message: 'Format email tidak valid'
    }
  }

  // PHONE
  // if (validator.isEmpty(data.phone_number)) {
  //   return {
  //     status: false,
  //     message: 'Nomor HP wajib diisi'
  //   }
  // }

  // if (!validator.isMobilePhone(data.phone_number, 'id-ID')) {
  //   return {
  //     status: false,
  //     message: 'Nomor HP tidak valid'
  //   }
  // }

  // CITY
  // if (validator.isEmpty(data.city)) {
  //   return {
  //     status: false,
  //     message: 'Kota wajib diisi'
  //   }
  // }

  // SKILLS (minimal 1)
  // if (!data.skills || data.skills.length === 0) {
  //   return {
  //     status: false,
  //     message: 'Minimal pilih 1 skill'
  //   }
  // }

  // DESCRIPTION (optional tapi bagus)
  // if (data.description && !validator.isLength(data.description, { min: 10 })) {
  //   return {
  //     status: false,
  //     message: 'Deskripsi minimal 10 karakter'
  //   }
  // }

  return {
    status: true,
    data
  }
}

export default registerValidation