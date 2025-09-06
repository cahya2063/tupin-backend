import validator from 'validator'
const sanitize = (data)=>{
    return{
        email: validator.escape(validator.trim(data.email)),
        password: validator.trim(String(data.password))
    }
}

const loginValidation = (dt)=>{
    let data = sanitize(dt)

    if(validator.isEmpty(data.email)){
        return{
            status: false,
            message: 'email wajib diisi'
        }
    }
    if(!validator.isEmail(data.email)){
        return{
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
    return{
        status: true,
        data: data
    }
}

export default  loginValidation







