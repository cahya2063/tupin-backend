import axios from "axios"
import userCollection from "../models/users.js"
import jobsCollection from "../models/jobs.js"
import mongoose from "mongoose"
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
const posCode = axios.create({
    headers: {
        'User-Agent': 'fixify-app/1.0 (cahya200603@gmail.com)'
    }
})



const getDestinationRequest = async(req, res, next)=>{
    try {
        const { postCode } = req.params
        const response = await destination.get(`https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${postCode}`)
        // console.log('destination : ', response.data);
        
        
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
        const {jobId} = req.params

        const jobs = await jobsCollection.findById(jobId)
        const technician = await userCollection.findById(jobs.selectedTechnician)
        
        
        const query = `https://api-sandbox.collaborator.komerce.id/tariff/api/v1/calculate?shipper_destination_id=${jobs.destination.destinationId}&receiver_destination_id=${technician.receiverLocation.destinationId}&weight=10&item_value=100000&cod=no&origin_pin_point=${jobs.location.lat}%2C${jobs.location.lng}&destination_pin_point=${technician.location.coordinates[1]}%2C${technician.location.coordinates[0]}`
        
        const response = await shippingCost.get(query)
        
        console.log('shipping cost : ', response.data.data);
        return res.json({
            success: true,
            shippingCost: response.data
        })
    } catch (error) {
        next(error)
    }
}

const calculateDistance = async(technicianId, lat, lng) =>{
    const result = await userCollection.aggregate([
        {
            $geoNear:{
                near: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                distanceField: 'distance',
                spherical: true,
                query: {
                    _id: new mongoose.Types.ObjectId(technicianId)
                }
            }
            
        }
    ])

    
    return result[0].distance / 1000
}

const calculatePickupFee = async(req, res, next)=>{
    const baseFee = 5000
    const pricePerKm = 3000
    const {
        lat,
        lng,
        size,
        technicianId,
    } = req.body

    const sizeMultiplier = {
        kecil: 1,
        sedang: 1.3,
        besar: 1.5,
        sangat_besar: 2.2
    }
    const distance = await calculateDistance(req.body.technicianId, lat, lng)

    console.log('distance : ', distance);
    
    const multiplier = sizeMultiplier[size] || 1
    const pickupFee = Math.round(baseFee + (distance * pricePerKm * multiplier))
    const shippingCost = Math.round(pickupFee / 1000) * 1000
    console.log('shipping fee : ', shippingCost);
    
    return res.json({
        success: true,
        shippingCost: shippingCost,
        distance: distance
    })
}
const getPosCode = async(req, res, next)=>{
    try {
        const {lat, lon} = req.body
        const response = await posCode.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}6&format=json`)
        return res.json({
            success: true,
            location: response.data
        })
        
    } catch (error) {
        
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



//test 1

export{
    // getProvinceRequest,
    // getCityRequest,
    getDestinationRequest,
    calculateShippingCost,
    calculatePickupFee,
    getPosCode
}