import validator from 'validator'

const sanitizeUpdate = (data) => {
  return {
    phone_number: data.phone_number !== undefined
      ? validator.escape(String(data.phone_number))
      : '',

    address: data.address
      ? validator.escape(validator.trim(String(data.address)))
      : '',

    village: data.village
      ? validator.escape(validator.trim(String(data.village)))
      : '',
    
    subdistrict: data.subdistrict
      ? validator.escape(validator.trim(String(data.subdistrict)))
      : '',
      
    city: data.city
      ? validator.escape(validator.trim(String(data.city)))
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

  // 🏘 village (opsional, huruf saja kalau diisi)
  if (data.village && !validator.isAlpha(data.village, 'en-US', { ignore: ' ' })) {
    return {
      status: false,
      message: 'Desa hanya boleh huruf'
    }
  }

  // 🏢 subdistrict (opsional, huruf saja kalau diisi)
  if (data.subdistrict && !validator.isAlpha(data.subdistrict, 'en-US', { ignore: ' ' })) {
    return {
      status: false,
      message: 'Kecamatan hanya boleh huruf'
    }
  }
  // 🌍 city (opsional, huruf saja kalau diisi)
  if (data.city && !validator.isAlpha(data.city, 'en-US', { ignore: ' ' })) {
    return {
      status: false,
      message: 'Kota hanya boleh huruf'
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
