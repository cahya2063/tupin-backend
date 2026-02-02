import axios from "axios"
const client = axios.create({
    headers:{
        'Key': process.env.SHIPPING_COST_API_KEY
    }
})
const getProvince = async(req, res, next)=>{
    try {
        const response = await client.get('https://rajaongkir.komerce.id/api/v1/destination/province')
        return response.data
    } catch (error) {
        next(error)
    }
}


export{
    getProvince
}