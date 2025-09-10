import validator from 'validator'

const sanitizeUpdate = (data) => {
  return {
    phone_number: data.phone_number !== undefined
      ? validator.escape(String(data.phone_number))
      : '',

    address: data.address
      ? validator.escape(validator.trim(String(data.address)))
      : '',

    country: data.country
      ? validator.escape(validator.trim(String(data.country)))
      : '',

    nama: data.nama
      ? validator.escape(validator.trim(String(data.nama)))
      : '',

    zip_code: data.zip_code !== undefined
      ? validator.escape(String(data.zip_code))
      : '',
  }
}

const updateProfileValidation = (dt) => {
  let data = sanitizeUpdate(dt)

  // 📱 phone_number (opsional tapi kalau ada → harus angka)
  if (data.phone_number && !validator.isMobilePhone(data.phone_number, 'id-ID')) {
    return {
      status: false,
      message: 'Nomor HP tidak valid'
    }
  }

  // 🏠 address (opsional, minimal 3 karakter kalau diisi)
  if (data.address && !validator.isLength(data.address, { min: 3 })) {
    return {
      status: false,
      message: 'Alamat minimal 3 karakter'
    }
  }

  // 🌍 country (opsional, huruf saja kalau diisi)
  if (data.country && !validator.isAlpha(data.country, 'en-US', { ignore: ' ' })) {
    return {
      status: false,
      message: 'Negara hanya boleh huruf'
    }
  }
  if (data.nama && !validator.isAlpha(data.nama, 'en-US', { ignore: ' ' })) {
    return {
      status: false,
      message: 'Nama hanya boleh huruf'
    }
  }

  // 📮 zip_code (opsional tapi harus angka kalau diisi)
  if (data.zip_code && !validator.isNumeric(data.zip_code)) {
    return {
      status: false,
      message: 'Kode pos harus angka'
    }
  }

  return {
    status: true,
    data: data
  }
}

export default updateProfileValidation
