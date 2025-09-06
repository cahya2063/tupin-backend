import validator from 'validator'

const sanitize = (data)=>{
    return {
        nama: validator.escape(validator.trim(data.nama)),
        email: validator.escape(validator.trim(data.email)),
        password: validator.trim(String(data.password))
    }
}

const registerValidation = (dt)=>{
    
    let data = sanitize(dt)

    if(validator.isEmpty(data.nama)){
        return {
            status: false,
            message: 'nama wajib diisi'
        }
    }
    if(validator.isEmpty(data.email)){
        return {
            status: false,
            message: 'email wajib diisi'
        }
    }
    if(!validator.isEmail(data.email)){
        return {
            status: false,
            message: 'format email tidak valid'
        }
    }
    if(validator.isEmpty(data.password)){
        return {
            status: false,
            message: 'password wajib diisi'
        }
    }
    if(!validator.isLength(data.password, {min: 6})){
        return {
            status: false,
            message: 'password minimal 6 karakter'
        }
    }
    return {
        status: true,
        data: data
    }

}

export default registerValidation


