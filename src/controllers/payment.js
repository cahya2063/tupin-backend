import midtransClient from 'midtrans-client';
// import { createDynamicSplitRule, createInvoiceRequest, createSplitRuleRequest, createSubAccountRequest } from '../services/xendit.service.js'
import axios from "axios";
import paymentCollection from '../models/payment.js';
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

// const createSplitRule = async () => {
//   const res = await client.post("/v2/split_rules", {
//     name: "platform-95-5",
//     currency: "IDR",
//     routes: [
//       {
//         reference_id: "teknisi",
//         destination_account_id: "<SUB_ACCOUNT_ID>",
//         percent_amount: 95
//       },
//       {
//         reference_id: "platform",
//         destination_account_id: process.env.PLATFORM_ACCOUNT_ID,
//         percent_amount: 5
//       }
//     ]
//   });

//   console.log("SPLIT RULE CREATED:", res.data.id);
//   return res.data;
// };


// const createInvoiceWithSplit = async (req, res) => {
//   try {
//     const { amount, payer_email, teknisiAccountId } = req.body;

//     const payload = {
//       external_id: `inv-${Date.now()}`,
//       amount,
//       payer_email,
//       with_split_rule_id: process.env.DEFAULT_SPLIT_RULE_ID,

//       // override route untuk transaksi ini
//       routes: [
//         {
//           destination_account_id: teknisiAccountId,
//           percent_amount: 95,
//         },
//         {
//           destination_account_id: process.env.PLATFORM_ACCOUNT_ID,
//           percent_amount: 5,
//         }
//       ]
//     };

//     const invoice = await client.post("/v2/invoices", payload)
//                                 .then(r => r.data);

//     return res.json({ success: true, invoice });

//   } catch (err) {
//     console.error(err.response?.data || err);
//     res.status(500).json(err.response?.data || err.message);
//   }
// };


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

const createInvoice = async (req, res) => {
  try {
    const { 
      amount, 
      payer_email, 
      subAccountId,
      jobId,
      payerId,
      receiverId,
     } = req.body;

    const externalId = `inv-${Date.now()}`;

    const payload = {
      external_id: externalId,
      amount,
      payer_email
    };

    const invoice = await client.post('/v2/invoices', payload)
      .then(r => r.data);

      console.log('invoice : ', invoice);
      
    await paymentCollection.create({
      externalId: externalId,
      jobId: jobId,
      payerId: payerId,
      receiverId: receiverId,
      subAccountId: subAccountId,
      amount: amount,
      status: invoice.status

    })

    return res.json({ success: true, invoice });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// =========================
// XENDIT WEBHOOK → TRANSFER 95%
// =========================
const handleXenditWebhooks = async (req, res) => {
  try {
    const event = req.body;

    console.log('event : ', event);
    

    if (!["PAID", "SETTLED"].includes(event.status)) {
      return res.status(200).send("ignored");
    }

    const externalId = event.external_id;

    // const amount = Number(event.amount);
    const payment = await paymentCollection.findOne({
      externalId: externalId,
    })

    if(!payment){
      return res.status(404).send("Payment not found");
    }

    const teknisiUserId = payment.subAccountId;     // ✔ WAJIB User ID
    const sourceUserId = process.env.PLATFORM_ACCOUNT_ID;        // ✔ WAJIB User ID

    const payoutAmount = Math.floor(payment.amount * 0.95);

    const payload = {
      reference: `payout-${externalId}`,
      amount: payoutAmount,
      source_user_id: sourceUserId,
      destination_user_id: teknisiUserId
    };

    const transfer = await client.post('/transfers', payload)
      .then(r => r.data);


    payment.status = 'PAID';
    payment.paymentMethod = event.payment_method;
    payment.paymentChannel = event.payment_channel;
    await payment.save();

    console.log("PAYOUT SUCCESS:", transfer);

    return res.status(200).send("OK");

  } catch (err) {
    console.error("WEBHOOK ERROR:", err.response?.data || err.message);
    return res.status(500).send("ERR");
  }
};


export {
    createTransactionGateway,
    createInvoice,
    handleXenditWebhooks
    // createSubAccount,
    // createSplitRule,
    // createInvoiceWithSplit,
    // handleXenditWebhooks
}