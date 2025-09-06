
import mongoos from "../utils/db.js";

const logInSchema = new mongoos.Schema({
    nama: {
        type: String,
        required: true
    },

    email:{
        type: String,
        required: true,
    },
    password: {
        type: String, 
        required: true
    }
})


const logInCollection = mongoos.model('User', logInSchema)

export default logInCollection


