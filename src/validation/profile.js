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
    description: data.description
      ? validator.trim(String(data.description))
      : '',


    zip_code: data.zip_code !== undefined
      ? validator.escape(String(data.zip_code))
      : '',

    receiverLocation: data.receiverLocation ?? null
  }
}

const updateProfileValidation = (dt) => {
  let data = sanitizeUpdate(dt)

  // 📱 phone_number (opsional tapi kalau ada → harus angka)
  if (data.phone_number && !validator.isMobilePhone(data.phone_number)) {
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

  if (typeof data.receiverLocation !== 'object' || data.receiverLocation === null) {
    return {
      status: false,
      message: 'receiverLocation harus berupa objek'
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
  if (data.description && !validator.isLength(data.description, { min: 3, max: 200 })) {
    return {
      status: false,
      message: 'Deskripsi minimal 3 karakter dan maksimal 200 karakter'
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
