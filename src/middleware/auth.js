import jwt from 'jsonwebtoken'
import 'dotenv/config'
const JWT_SECRET = process.env.JWT_SECRET

const authMiddleware = (req, res, next)=>{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // ambil setelah "Bearer"

    if(!token){
        return res.status(401).json({
            message: 'token tidak ditemukan'
        })
    }

    jwt.verify(token, JWT_SECRET, (err, user)=>{
        if(err){
            return res.status(403).json({
                message: 'token tidak valid'
            })
        }
        req.user = user
        next()
    })
}
const authRole = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(401).json({
        message: 'Akses ditolak'
      })
    }
    next()
  }
}

export {
    authMiddleware,
    authRole
}





