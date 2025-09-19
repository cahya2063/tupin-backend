import { compare } from "bcrypt"
import userCollection from "../models/users.js"
import loginValidation from "../validation/login.js"
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const JWT_SECRET = process.env.JWT_SECRET
const postLogin = async(req, res)=>{
    try {
        const validasi = loginValidation(req.body)
        if(validasi?.status === false){
            return res.status(400).json({
                'message': validasi.message
            })
        }

        const isUserExist = await userCollection.findOne({
            email: validasi.data.email
        })

        if(!isUserExist){
            return res.status(400).json({
                'message': 'email tidak terdaftar'
            })
        }
        
        const isPasswordMatch = await compare(String(validasi.data.password), isUserExist.password)

        if(!isPasswordMatch){
            return res.status(400).json({
                message: 'password salah'
            })
        }

        // make jwt token
        const token = jwt.sign({
            id: isUserExist._id,
            email: isUserExist.email,
            nama: isUserExist.nama
        },
        JWT_SECRET,
        {expiresIn: '2h'}
        )

        return res.status(200).json({
            message: 'login berhasil',
            token: token,
            data: {
                id: isUserExist._id,
                nama: isUserExist.nama,
                email: isUserExist.email,
                role: isUserExist.role
            }
        })

    } catch (error) {
        console.log('login error : ',error);
        return res.status(500).json({
            message: 'terjadi kesalahan server'
        })
        
    }
    
}

export {postLogin}