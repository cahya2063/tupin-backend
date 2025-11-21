import midtransClient from 'midtrans-client';
import { createSubAccountRequest } from '../services/xendit.service.js'
// Create Snap API instance
let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

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
      business_name: req.body.business_name,
      business_email: req.body.business_email,
      type: req.body.type || 'OWNED'
    }

    const data = await createSubAccountRequest(body)
    return res.json({ success: true, data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ success:false, message: error.response?.data || error.message });
  }
}

export {
    createTransactionGateway,
    createSubAccount
}