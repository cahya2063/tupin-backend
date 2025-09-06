import bcrypt from 'bcrypt';

const salRound = 10;

const encrypt = (password)=>{
    return bcrypt.hash(password, salRound)
}

const compare = (password, hash)=>{
    return bcrypt.compare(password, hash)
}

export {encrypt, compare}






