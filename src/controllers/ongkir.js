import { getCityRequest, getProvinceRequest } from "../services/ongkir.service.js";

const getProvincesList = async(req, res, next)=>{
    try {        
        const province = await getProvinceRequest()
        return res.json({
            success: true,
            data: province
        })
        
    } catch (error) {
        next(error)
    }
}

const getCityList = async(req, res, next)=>{
    try {
        const { provinceId } = req.params
        const city = await getCityRequest(provinceId)
        return res.json({
            success: true,
            data: city
        })
    } catch (error) {
        next(error)
    }
}

export{
    getProvincesList,
    getCityList

}