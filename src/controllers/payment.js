import midtransClient from 'midtrans-client';
import { createDynamicSplitRule, createInvoiceRequest, createSplitRuleRequest, createSubAccountRequest } from '../services/xendit.service.js'
import axios from "axios";
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

const createSubAccount = async(req, res)=>{// xendit
  try {
    const body = {
      type: req.body.type || "MANAGED",
      email: req.body.business_email,
      public_profile: {
        business_name: req.body.business_name
      }
    };

    const data = await createSubAccountRequest(body)
    return res.json({ success: true, data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ success:false, message: error.response?.data || error.message });
  }
}

const createSplitRule = async(teknisiAccountId)=>{
  const res = await client.post("/split_rules", {
    name: "Split Teknisi dan Platform",
    currency: "IDR",
    routes: [
      {
        reference_id: `teknisi-${Date.now()}`,
        destination_account_id: teknisiAccountId,
        percent_amount: 95,
        currency: "IDR"
      },
      {
        reference_id: `platform-${Date.now()}`,
        destination_account_id: process.env.PLATFORM_ACCOUNT_ID,
        percent_amount: 5,
        currency: "IDR"
      }
    ]
  });

  return res.data;
}

const createInvoiceWithSplit = async (req, res) => {
  try {
    const { amount, teknisiAccountId, payer_email } = req.body;

    // 1. Buat split rule
    const splitRule = await createSplitRule(teknisiAccountId);

    // 2. Buat invoice
    const payload = {
      external_id: `inv-${Date.now()}`,
      amount: amount,
      payer_email: payer_email,
      with_split_rule_id: splitRule.id
    };

    const invoice = await client.post("/v2/invoices", payload).then(r => r.data);

    res.json({
      success: true,
      invoice
    });

  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json(err.response?.data || err.message);
  }
};


const handleXenditWebhooks = async (req, res) => {
  try {
    const payload = req.body;
    // simpan payload ke logs DB
    // jika payload.status === 'PAID' || payload.status === 'SETTLED' maka:
    //   - update order di DB
    //   - cek dashboard Xendit -> split applied
    res.status(200).send('OK');
  } catch (e) {
    res.status(500).send('ERR');
  }
};

export {
    createTransactionGateway,
    createSubAccount,
    createSplitRule,
    createInvoiceWithSplit,
    handleXenditWebhooks
}