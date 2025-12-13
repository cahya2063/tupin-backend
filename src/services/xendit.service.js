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
  console.log('body tech : ', body);
    const response = await client.post('/v2/accounts', {
      email: body.business_email,
      type: body.type,
      public_profile: {
        business_name: body.business_name,
        description: 'pembuatan sub account teknisi',
      }
    });
    
    console.log('response : ', response.data);
    
    return response.data
}

// const createSplitRuleRequest = async(body)=>{
//     const response = await client.post('/split_rules', body);
//     return response.data
// }

// const createDynamicSplitRule = async (teknisiAccountId) => {
//   const res = await client.post("/split_rules", {
//     name: "Split Teknisi 95% - Platform 5%",
//     currency: "IDR",
//     routes: [
//       {
//         reference_id: `teknisi-${Date.now()}`,
//         destination_account_id: teknisiAccountId,
//         percent_amount: 95,
//         currency: "IDR"
//       },
//       {
//         reference_id: `platform-${Date.now()}`,
//         destination_account_id: process.env.PLATFORM_ACCOUNT_ID,
//         percent_amount: 5,
//         currency: "IDR"
//       }
//     ]
//   });

//   return res.data;
// };


// const createInvoiceRequest = async (body) => {
//   const res = await client.post('/v2/invoices', body);
//   return res.data;
// };


export {
    createSubAccountRequest,
    // createSplitRuleRequest,
    // createInvoiceRequest,
    // createDynamicSplitRule
    
}