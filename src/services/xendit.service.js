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
  try {
    
    const response = await client.post('/v2/accounts', {
      email: body.business_email,
      type: body.type,
      public_profile: {
        business_name: body.business_name,
        description: 'pembuatan sub account teknisi',
      }
    });
    console.log('subaccount : ', response.data);
    
    return response.data
  } catch (error) {
    return console.log('error : ', error.message);
  }
}
// const createSplitRuleRequest = async(body)=>{ //teknisi register
//   try {
//     const response = await client.post('/split_rules', body)
//     // console.log('split rules : ', response.data);
    
//     return response.data
//   } catch (error) {
//     console.log('error : ', error);
    
//   }
// }

const createInvoicesRequest = async(body)=>{ // client
  const response = await client.post(`/v2/invoices`, body)
    return response.data
}

const getInvoiceRequest = async (invoiceId) => {
  const response = await client.get(`/v2/invoices/${invoiceId}`)
  return response.data
}

const createTransferRequest = async(body)=>{
  try {
    const response = await client.post(`transfers`, body)
    return response.data
  } catch (error) {
    console.error(error);
    
  }
}

const getTransferRequest = async(referenceId)=>{
  try {
    const response = await client.get(`transfers/reference=${referenceId}`)
    return response.data
  } catch (error) {
    console.error(error);
    
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


const getPayoutsChannels = async(channel_name)=>{// teknisi
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



const createDisbursementsRequest = async(body)=>{// teknisi
  try {
    
    const {reference_id, subAccountId} = body
    
    
    const response = await client.post('/disbursements', 
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

const getDisbursementsRequest = async(payoutId, subAccountId)=>{
  try {
    console.log('payoutId : ', payoutId);
    
    const response = await client.get(`/disbursements/${payoutId}`, {
      headers: {
        'for-user-id': subAccountId
      }
    })

    console.log('response payout : ', response);
    
    return response.data
  } catch (error) {
    console.log(error);    
  }
}




export {
    createSubAccountRequest,
    // createSplitRuleRequest,
    getPayoutsChannels,
    checkBalanceRequest,
    createTransferRequest,
    getTransferRequest,
    createDisbursementsRequest,
    getDisbursementsRequest,
    createInvoicesRequest,
    getInvoiceRequest
    // createInvoiceRequest, 
    // createTransferTehnicianRequest,
    // createSplitRuleRequest,
    // createInvoiceRequest,
    // createDynamicSplitRule
    
}