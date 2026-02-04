import axios from "axios"
import userCollection from "../models/users.js"
const client = axios.create({
    headers:{
        'Key': process.env.SHIPPING_COST_API_KEY
    }
})
const getProvinceRequest = async(req, res, next)=>{
    try {
        const response = await client.get('https://rajaongkir.komerce.id/api/v1/destination/province')
        return response.data
    } catch (error) {
        next(error)
    }
}

const getCityRequest = async(provinceId)=>{
    try {
        const response = await client.get(`https://rajaongkir.komerce.id/api/v1/destination/city/${provinceId}`)
        return response.data
    } catch (error) {
        console.log('error : ', error);
        
    }
}


const getNearestTechnician = async(req, res)=>{
    const {lat, lng} = req.body
    const technicians = await userCollection.aggregate([
        {
            $geoNear: {
            near:{
                type: "Point",
                coordinates: [lng, lat]
            },
            distanceField: 'distance',
            spherical: true,
            distanceMultiplier: 0.001, // rubah dari Km ke Meter
            query: { role: 'technician' }
            }
        },
        {
            $sort: { distance: 1 }// asc
        },
        {
            $limit: 10
        },
        {
            $project:{
                _id: 1,
                nama: 1,
                distance: 1
            }
        }
    ])
    return res.json({
        success: true,
        data: technicians
    })
}
// test1

export{
    getProvinceRequest,
    getCityRequest,
    getNearestTechnician
}