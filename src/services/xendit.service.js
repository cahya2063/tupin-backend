import axios from "axios";
const baseUrl = process.env.XENDIT_API_BASE;
const auth = {
    username: process.env.XENDIT_SECRET_KEY,
}

const client = axios.create({
    baseURL: baseUrl,
    auth: auth,
})

const createSubAccountRequest = async(body)=>{
    const response = await client.post('/v2/accounts', body);
    // console.log('response : ', response);
    
    return response.data
}

const createSplitRuleRequest = async(body)=>{
    const response = await client.post('/split_rules', body);
    return response.data
}

const createInvoiceRequest = async(body, options={})=>{
    const config = {
        headers: {}
    }
    if(options.forUserId){
        config.headers['for-user-id'] = options.forUserId
    }
    const response = await client.post('/v2/invoices', body, config);
    return response.data
}


export {
    createSubAccountRequest,
    createSplitRuleRequest,
    createInvoiceRequest
    
}