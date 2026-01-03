import midtransClient from 'midtrans-client';
// import { createDynamicSplitRule, createInvoiceRequest, createSplitRuleRequest, createSubAccountRequest } from '../services/xendit.service.js'
import axios from "axios";
import paymentCollection from '../models/payment.js';
import { checkBalanceRequest, createPayoutRequest, createSplitInvoicesRequest, createSplitRuleRequest, getInvoiceRequest, getPayoutsChannels } from '../services/xendit.service.js';
import userCollection from '../models/users.js';
import payoutCollection from '../models/payout.js';
import jobsCollection from '../models/jobs.js';
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

const createTransactionGateway = async (req, res) => { // midtrans, client
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


const createSplitRule = async (subAccountId) => { // teknisi register
  try {
    
    const data = {
      name: "split rule platform dan teknisi",
      description: "pembagian pembayaran antara teknisi dan platform",
      routes: [
        {
          percent_amount: 95,
          currency: "IDR",
          destination_account_id: subAccountId,
          reference_id: "reference-1"
        },
        {
          percent_amount: 5,
          currency: "IDR",
          destination_account_id: process.env.PLATFORM_ACCOUNT_ID,
          reference_id: "reference-2"
        }
      ]
    }
    const response = await createSplitRuleRequest(data)
    // const response = await client.post("/split_rules", {
    //   name: "split rule platform dan teknisi",
    //   description: "pembagian pembayaran antara teknisi dan platform",
    //   routes: [
    //     {
    //       percent_amount: 95,
    //       currency: "IDR",
    //       destination_account_id: subAccountId,
    //       reference_id: "reference-1"
    //     },
    //     {
    //       percent_amount: 5,
    //       currency: "IDR",
    //       destination_account_id: process.env.PLATFORM_ACCOUNT_ID,
    //       reference_id: "reference-2"
    //     }
    //   ]
    // });
    
  
    console.log("SPLIT RULE CREATED:", response.data.id);
    return response.data;
  } catch (error) {
    console.log('error : ', error);
    
  }
};



const createInvoiceWithSplit = async (req, res, next) => { // client
  try {
    const { subAccountId, amount, payer_email, jobId, payerId, receiverId } = req.body;
    const externalId = `inv-${Date.now()}`

    const job = await jobsCollection.findOne({_id: jobId})
    if(!job){
      return res.status(404).json({
        success: false,
        message: "Job tidak ditemukan"
      })
    }
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
      description: `Pembayaran jasa perbaikan ${job.title}`
    }
    const invoice = await createSplitInvoicesRequest(payload)
    // console.log('berhasil membayar : ', invoice);


    // simpan record pembayaran di DB
    await paymentCollection.create({
      invoiceId: invoice.id,
      externalId: externalId,
      jobId: jobId,
      payerId: payerId,
      receiverId: receiverId,
      subAccountId: subAccountId,
      amount: invoice.amount,
      status: invoice.status

    })
    
    return res.status(200).json({ success: true, invoices: invoice });

  } catch (err) {
    console.error(err.invoice?.data || err);
    res.status(500).json(err.invoice?.data || err.message);
    next(err)
  }
};




const checkBalance = async (req, res, next)=>{ // teknisi
  try {
    const {subAccountId} = req.params;
    
    const response = await checkBalanceRequest(subAccountId);

    // console.log('balance : ', response);
    return res.status(200).json({
      success: true,
      balance : response.balance
    })
  } catch (error) {
    next(error)
  }
}



const createPayout = async(req, res, next)=>{// teknisi
  try {
    
    const {technicianId, amount, channelName, accountNumber}= req.body
    const referenceId = `payout-${Date.now()}`
    const channelCode = `ID_${channelName}`
    console.log(`debug payout : ${technicianId}, ${amount}, ${channelCode}`);

    
    const technician = await userCollection.findById(technicianId)
    if(!technician || !technician.subAccountId){
      return res.status(404).json({
        success: false,
        message: 'Teknisi tidak ditemukan atau belum memiliki sub account'
      })
    }

    
    const paymentChannels = await getPayoutsChannels(channelCode)
    console.log('payment channels : ',paymentChannels);

    let minimumLimits = paymentChannels[0].amount_limits.minimum
    let maximumLimits = paymentChannels[0].amount_limits.maximum

    if(amount < minimumLimits || amount > maximumLimits){
      return res.status(200).json({
        success: false,
        minimumLimits,
        maximumLimits,
        message: `minimum nilai transaksi adalah Rp ${minimumLimits} dan maksimal Rp ${maximumLimits}`
      })
    }
    
    const technicianBalance = await checkBalanceRequest(technician.subAccountId)
    // console.log('technician balance : ', technicianBalance.balance);
    
    if(technicianBalance.balance < amount){
      return res.status(200).json({
        success: false,
        message: 'saldo tidak mencukupi'
      })
    }
    
    const payload = {
      reference_id: referenceId,
      subAccountId: technician.subAccountId,
      channel_code: paymentChannels[0].channel_code,
      channel_properties: {
        account_number: accountNumber,
        account_holder_name: technician.nama
      },
      amount: amount,
      description: `Payout untuk teknisi ${technician.nama}`,
      currency: "IDR"
    }

    const payout = await createPayoutRequest(payload)
    console.log('payout : ', payout);

    payoutCollection.create({
      payoutId: payout.id,
      amount: payout.amount,
      channelCode: payout.channel_code,
      currency: payout.currency,
      referenceId: payout.reference_id,
      status: payout.status
    })

    
    return res.status(200).json({
      success: true,
      message: 'berhasil melakukan penarikan saldo',
      payout: payout.data
    })
    
  } catch (error) {
    next(error)
    
  }
}

const getInvoices = async (req, res, next) => {// client
  try {
    const { userId } = req.params    

    const invoiceData = await paymentCollection.find({$or: [{payerId: userId}, {receiverId: userId}]})
    
    const payments = invoiceData.map(async (data)=>{      
      const invoice = await getInvoiceRequest(data.invoiceId, data.subAccountId)

      // if(data.status == 'PENDING'){
      data.status = invoice.status
      await data.save()
      // }
      // return invoice
      return {
        id: invoice.id,
        jobId: data.jobId,
        external_id: invoice.external_id,
        status: data.status,
        merchant_name: invoice.merchant_name,
        amount: invoice.amount,
        paid_amount: invoice.paid_amount,
        paid_at: invoice.paid_at,
        created: invoice.created,
        currency: invoice.currency,
        payment_method: invoice.payment_method,
        payment_channel: invoice.payment_channel,
        description: invoice.description,
        url: invoice.invoice_url,
        isClientDelete: data.isClientDelete,
        isTechnicianDelete: data.isTechnicianDelete
      }
    })
    const results = await Promise.all(payments)
    
    return res.status(200).json({
      success: true,
      invoices: results
    })

  } catch (error) {
    console.error(error.response?.data || error.message)
    // return res.status(404).json({
    //   success: false,
    //   message: error.message
    // })
    next(error)
  }
}

const deleteInvoice = async (req, res, next)=>{
  try {
    const {externalId} = req.params

    const invoice = await paymentCollection.findOne({
      externalId: externalId
    })
    if(!invoice){
      return res.status(404).json({
        success: false,
        message: 'invoice tidak ditemukan'
      })
    }
    invoice.isClientDelete = true
    await invoice.save()

    return res.status(200).json({
      success: true,
      message: 'invoice berhasil di hapus dari riwayat Pembayaran'
    })
  } catch (error) {
    next(error)
  }
}


// =========================
// XENDIT WEBHOOK → TRANSFER 95%
// =========================
const handleXenditWebhooksInvoices = async (req, res) => {// xendit execution
  try {
    const event = req.body;

    console.log('event1 : ', event.id);
    

    const id = event.id;

    // const amount = Number(event.amount);
    const payment = await paymentCollection.findOne({
      invoiceId: id,
    })
    // console.log('payment : ', payment);
    

    // if(!payment){
    //   return res.status(404).send("Payment not found");
    // }

    payment.status = event.status;

    await payment.save();

    return res.status(200).send("OK");

  } catch (err) {
    // console.error("WEBHOOK ERROR:", err.response?.data || err.message);
    return res.status(500).send("ERR");
  }
};

const handleXenditWebhooksPayout = async (req, res)=>{
  try {
    console.log('event : ', req.body);
    
    return res.status(200).send("OK");
  } catch (error) {
    return res.status(500).send("ERR");
  }
}



export {
    createTransactionGateway,
    checkBalance,
    createSplitRule,
    createInvoiceWithSplit,
    handleXenditWebhooksInvoices,
    createPayout,
    getInvoices,
    deleteInvoice,
    handleXenditWebhooksPayout
    // createInvoice,
    // createSubAccount,
    // handleXenditWebhooks
}