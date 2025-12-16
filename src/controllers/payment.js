import midtransClient from 'midtrans-client';
// import { createDynamicSplitRule, createInvoiceRequest, createSplitRuleRequest, createSubAccountRequest } from '../services/xendit.service.js'
import axios from "axios";
import paymentCollection from '../models/payment.js';
import { checkBalanceRequest, createPayoutRequest, createSplitInvoicesRequest } from '../services/xendit.service.js';
import userCollection from '../models/users.js';
// Create Snap API instance
let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

const baseUrl = process.env.XENDIT_API_BASE;
const auth = {
    username: process.env.XENDIT_SECRET_KEY,
}

const client = axios.create({
    baseURL: baseUrl,
    auth: auth,
})

const createTransactionGateway = async (req, res) => { // midtrans
  try {

    console.log("SERVER KEY :", process.env.MIDTRANS_SERVER_KEY);

    // console.log('req body : ', req.body);
    const {amount, customer_details} = req.body;
    
    const payload = {
      transaction_details: {
        order_id: `GATEWAY-${Date.now()}`,
        gross_amount: Number(amount),
      },
      customer_details: {
        first_name: customer_details.name,
        email: customer_details.email
      }
    };

    const transaction = await snap.createTransaction(payload);

    return res.status(200).json({
        token: transaction.token,
        redirect_url: transaction.redirect_url,
    });

  } catch (error) {
    console.log("MIDTRANS ERROR :", error);
    return res.status(500).json({
      message: "gagal membuat transaksi",
      error: error.message,
    });
  }
};

const createTransactionCash = async(req, res)=>{ // client
    try {
        
    } catch (error) {
        
    }
}

// const createSubAccount = async(req, res)=>{// xendit
//   try {
//     const body = {
//       type: req.body.type || "MANAGED",
//       email: req.body.business_email,
//       public_profile: {
//         business_name: req.body.business_name
//       }
//     };

//     const data = await createSubAccountRequest(body)
//     return res.json({ success: true, data });
//   } catch (error) {
//     console.error(error.response?.data || error.message);
//     return res.status(500).json({ success:false, message: error.response?.data || error.message });
//   }
// }

const createSplitRule = async (req, res) => {
  try {
    
    const response = await client.post("/split_rules", {
      name: "split rule platform dan teknisi",
      description: "Platform fee and delivery fee for a Marketplace",
      routes: [
        {
          percent_amount: 95,
          currency: "IDR",
          destination_account_id: req.body.subAccountId,
          reference_id: "reference-1"
        },
        {
          percent_amount: 5,
          currency: "IDR",
          destination_account_id: process.env.PLATFORM_ACCOUNT_ID,
          reference_id: "reference-2"
        }
      ]
    });
    
  
    console.log("SPLIT RULE CREATED:", response.data.id);
    return res.json({ success: true, data: response.data });
  } catch (error) {
    console.log('error : ', error);
    
  }
};



const createInvoiceWithSplit = async (req, res) => {
  try {
    const { subAccountId, amount, payer_email } = req.body;
    const externalId = `inv-${Date.now()}`
    const technician = await userCollection.findOne({
      subAccountId: subAccountId
    });
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Teknisi dengan subAccountId tersebut tidak ditemukan",
      });
    }
    

    const payload = {
      external_id: externalId,
      split_rule_id: technician.split_rule_id,
      subAccountId: subAccountId,
      amount,
      payer_email,
      description: "Pembayaran jasa servis"
    }
    const response = await createSplitInvoicesRequest(payload)
    console.log('berhasil membayar : ', response);
    
    return res.status(200).json({ success: true, invoices: response });

  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json(err.response?.data || err.message);
  }
};


// const handleXenditWebhooks = async (req, res) => {
//   try {
//     const payload = req.body;
//     // simpan payload ke logs DB
//     // jika payload.status === 'PAID' || payload.status === 'SETTLED' maka:
//     //   - update order di DB
//     //   - cek dashboard Xendit -> split applied
//     res.status(200).send('OK');
//   } catch (e) {
//     res.status(500).send('ERR');
//   }
// };

const checkBalance = async (req, res, next)=>{
  try {
    const {userId} = req.params;
    
    const response = await checkBalanceRequest(userId);

    console.log('balance : ', response);
    return res.status(200).json({
      success: true,
      balance : response.balance
    })
  } catch (error) {
    next(error)
  }
}

// const createInvoice = async (req, res) => {
//   try {
//     const { 
//       amount, 
//       payer_email, 
//       subAccountId,
//       jobId,
//       payerId,
//       receiverId,
//      } = req.body;

//     const externalId = `inv-${Date.now()}`;

//     const payload = {
//       external_id: externalId,
//       amount,
//       payer_email
//     };

//     const invoice = await createInvoiceRequest(payload)

//       console.log('invoice : ', invoice);
      
//     await paymentCollection.create({
//       externalId: externalId,
//       jobId: jobId,
//       payerId: payerId,
//       receiverId: receiverId,
//       subAccountId: subAccountId,
//       amount: amount,
//       status: invoice.status

//     })

//     return res.json({ success: true, invoice });

//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

const createPayout = async(req, res)=>{
  try {
    const {technicianId, amount}= req.body
    const referenceId = `payout-${Date.now()}`

    const technician = await userCollection.findById(technicianId)
    if(!technician || !technician.subAccountId){
      return res.status(404).json({
        success: false,
        message: 'Teknisi tidak ditemukan atau belum memiliki sub account'
      })
    }

    const payload = {
      reference_id: referenceId,
      subAccountId: technician.subAccountId,
      channel_code: technician.bank_name,
      channel_properties: {
        account_number: technician.account_number,
        account_holder_name: technician.nama
      },
      amount: amount,
      description: `Payout untuk teknisi ${technician.nama}`,
      currency: "IDR"
    }

    const response = await createPayoutRequest(payload)
    
    return res.status(200).json({
      success: true,
      payout: response
    })
    
  } catch (error) {
    console.log(error);
    
  }
}



// =========================
// XENDIT WEBHOOK → TRANSFER 95%
// =========================
const handleXenditWebhooksInvoices = async (req, res) => {
  try {
    // const event = req.body;

    // console.log('event : ', event);
    

    // if (!["PAID", "SETTLED"].includes(event.status)) {
    //   return res.status(200).send("ignored");
    // }

    // const externalId = event.external_id;

    // // const amount = Number(event.amount);
    // const payment = await paymentCollection.findOne({
    //   externalId: externalId,
    // })

    // if(!payment){
    //   return res.status(404).send("Payment not found");
    // }

    // const teknisiUserId = payment.subAccountId;     // ✔ WAJIB User ID
    // const sourceUserId = process.env.PLATFORM_ACCOUNT_ID;        // ✔ WAJIB User ID

    // const payoutAmount = Math.floor(payment.amount * 0.95);

    // const payload = {
    //   reference: `payout-${externalId}`,
    //   amount: payoutAmount,
    //   source_user_id: sourceUserId,
    //   destination_user_id: teknisiUserId
    // };


    // const transfers = await createTransferTehnicianRequest(payload)

    // payment.status = 'PAID';
    // payment.paymentMethod = event.payment_method;
    // payment.paymentChannel = event.payment_channel;
    // await payment.save();

    // console.log("PAYOUT SUCCESS:", transfers);

    return res.status(200).send("OK");

  } catch (err) {
    console.error("WEBHOOK ERROR:", err.response?.data || err.message);
    return res.status(500).send("ERR");
  }
};


export {
    createTransactionGateway,
    checkBalance,
    // createInvoice,
    createPayout,
    handleXenditWebhooksInvoices,
    // createSubAccount,
    createSplitRule,
    createInvoiceWithSplit,
    // handleXenditWebhooks
}