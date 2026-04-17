import axios from "axios"
import userCollection from "../models/users.js"
import jobsCollection from "../models/jobs.js"
const destination = axios.create({
    headers:{
        'Key': process.env.DESTINATION_API_KEY
    }
})
const shippingCost = axios.create({
    headers: {
        'x-api-key': process.env.SHIPPING_COST_API_KEY
    }
})



const getDestinationRequest = async(req, res, next)=>{
    try {
        const { postCode } = req.params
        const response = await destination.get(`https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${postCode}`)
        return res.json({
            success: true,
            destination: response.data
        })
    } catch (error) {
        next(error)
    }
}

const calculateShippingCost = async(req, res, next)=>{
    try {
        const {jobId, technicianId} = req.body

        const jobs = await jobsCollection.findById(jobId)
        const technician = await userCollection.findById(technicianId)

        const query = `https://api-sandbox.collaborator.komerce.id/tariff/api/v1/calculate?shipper_destination_id=${technician.receiverLocation.destinationId}&receiver_destination_id=${jobs.destination.destinationId}&weight=10&item_value=100000&cod=no&origin_pin_point=${technician.location.coordinates[1]}%2C${technician.location.coordinates[0]}&destination_pin_point=${jobs.location.lat}%2C${jobs.location.lng}`
        
        const response = await shippingCost.get(query)

        return res.json({
            success: true,
            shippingCost: response.data
        })
    } catch (error) {
        next(error)
    }
}
// const getProvinceRequest = async(req, res, next)=>{
//     try {
//         const response = await client.get('https://rajaongkir.komerce.id/api/v1/destination/province')
//         return response.data
//     } catch (error) {
//         next(error)
//     }
// }

// const getCityRequest = async(provinceId)=>{
//     try {
//         const response = await client.get(`https://rajaongkir.komerce.id/api/v1/destination/city/${provinceId}`)
//         return response.data
//     } catch (error) {
//         console.log('error : ', error);
        
//     }
// }


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
                query: { role: 'technician' },
                // maxDistance: 7000
            }
        },
        {
            $sort: { distance: 1 }// ascending
        },
        {
            $limit: 10
        },
        {
            $project:{
                _id: 1,
                distance: 1
            }
        }
    ])
    return res.json({
        success: true,
        technicians
    })
}
//test 1

export{
    // getProvinceRequest,
    // getCityRequest,
    getDestinationRequest,
    getNearestTechnician,
    calculateShippingCost,
}