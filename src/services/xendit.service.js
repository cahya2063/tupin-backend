import axios from "axios";
const baseUrl = process.env.XENDIT_API_BASE;
const auth = {
    username: process.env.XENDIT_SECRET_KEY,
}

const client = axios.create({
    baseURL: baseUrl,
    auth: auth,
})



const createSubAccountRequest = async(body)=>{ // teknisi register
    const response = await client.post('/v2/accounts', {
      email: body.business_email,
      type: body.type,
      public_profile: {
        business_name: body.business_name,
        description: 'pembuatan sub account teknisi',
      }
    });
        
    return response.data
}

const createSplitRuleRequest = async(body)=>{ //teknisi register
  try {
    const response = await client.post('/split_rules', body)
    return response.data
  } catch (error) {
    console.log('error : ', error);
    
  }
}

const getPayoutsChannels = async(channel_name)=>{
  try {
    // const { channel_code } = req.query;
    const response = await client.get('/payouts_channels',{
      params:{
        // currency: 'IDR',
        channel_code : channel_name,
      }
    })
    // console.log('response');
    return response.data
    // return res.json({
    //   success: true,
    //   channels: response.data
    // })
    
  } catch (error) {
    console.log('error : ', error);
    
  }
}

const checkBalanceRequest = async(subAccountId)=>{// teknisi
  try {    
    const response = await client.get('/balance', {
      headers: {
        'Content-Type': 'application/json',
        'for-user-id': subAccountId
      }
    })
  
    
    console.log('balance : ', response.data);
    return response.data
  } catch (error) {
    console.log('error : ', error);
    
    
  }
  
}

const createPayoutRequest = async(body)=>{// teknisi
  try {
    
    const {reference_id, subAccountId} = body
    
    
    const response = await client.post('/v2/payouts', 
      body,
      {
        headers: {
          'idempotency-key': reference_id,
          'for-user-id': subAccountId
        },
      }
    )
  
    return response.data
  } catch (error) {
    console.log('error : ', error);
    
  }
}


const createSplitInvoicesRequest = async(body)=>{ // client
  const response = await client.post(`/v2/invoices`, 
    body, 
    {
      headers:{
        'with-split-rule': body.split_rule_id,
        // 'api-version': '2024-11-11',
        'for-user-id': body.subAccountId
      }
    })
    console.log('response : ', response.data);
    return response.data

    
}

export {
    createSubAccountRequest,
    createSplitRuleRequest,
    getPayoutsChannels,
    checkBalanceRequest,
    createPayoutRequest,
    createSplitInvoicesRequest
    // createInvoiceRequest, 
    // createTransferTehnicianRequest,
    // createSplitRuleRequest,
    // createInvoiceRequest,
    // createDynamicSplitRule
    
}