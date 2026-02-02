import { getProvince } from "../services/ongkir.service.js";

const getProvincesList = async(req, res, next)=>{
    try {
        console.log('test ongkir');
        
        const province = await getProvince()
        return res.json({
            success: true,
            data: province
        })
        
    } catch (error) {
        next(error)
    }
}


export{
    getProvincesList
}