import midtransClient from 'midtrans-client';
// import { createDynamicSplitRule, createInvoiceRequest, createSplitRuleRequest, createSubAccountRequest } from '../services/xendit.service.js'
import axios from 'axios';
import paymentCollection from '../models/payment.js';
import {
  checkBalanceRequest,
  createInvoicesRequest,
  createTransferRequest,
  getInvoiceRequest,
  getPayoutsChannels,
  getTransferRequest,
  createDisbursementsRequest,
  getDisbursementsRequest,
} from '../services/xendit.service.js';
import userCollection from '../models/users.js';
import payoutCollection from '../models/payout.js';
import jobsCollection from '../models/jobs.js';
import transfersCollection from '../models/transfer.js';
import { io } from '../index.js';
import { emitToJobParties } from '../utils/tools.js';
// Create Snap API instance
// let snap = new midtransClient.Snap({
//   isProduction: false,
//   serverKey: process.env.MIDTRANS_SERVER_KEY,
// });

const baseUrl = process.env.XENDIT_API_BASE;
const auth = {
  username: process.env.XENDIT_SECRET_KEY,
};

const client = axios.create({
  baseURL: baseUrl,
  auth: auth,
});

const transferRules = {
  // tipe transfer
  transportation: [
    // status job valid untuk transfer
    'checked',
    'pending repair payment',
    'repair paid',
    'warranty',
    'completed',
  ],
  repair: ['warranty','completed'],
};

// apakah transfer valid berdasarkan status job dan tipe transfer?
const isValidTransfer = (jobStatus, type) => {
  return transferRules[type]?.includes(jobStatus);
};

const createInvoice = async (req, res, next) => {
  // technician
  try {
    const {
      subAccountId,
      amount,
      payer_email,
      jobId,
      payerId,
      receiverId,
      jobStatus,
    } = req.body;
    const externalId = `inv-${Date.now()}`;

    const job = await jobsCollection.findOne({ _id: jobId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job tidak ditemukan',
      });
    }
    const technician = await userCollection.findOne({
      subAccountId: subAccountId,
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Teknisi dengan subAccountId tersebut tidak ditemukan',
      });
    }
    const payload = {
      external_id: externalId,
      subAccountId: technician.subAccountId,
      amount,
      payer_email,
      description:
        job.status == 'open'
          ? `Pembayaran transportasi ${job.title}`
          : `Pembayaran jasa perbaikan ${job.title}`,
    };
    const invoice = await createInvoicesRequest(payload);
    console.log('berhasil buat invoice : ', invoice);

    if (jobStatus == 'open') {
      job.status = 'pending transport fee';
      await job.save();
      await paymentCollection.create({
        invoiceId: invoice.id,
        externalId: externalId,
        jobId: jobId,
        type: 'transportation',
        payerId: payerId,
        receiverId: receiverId,
        subAccountId: technician.subAccountId,
        amount: invoice.amount,
        status: invoice.status,
      });

      emitToJobParties('job:pending-transport', job, {
        jobId: job._id,
        status: job.status,
      });
    } else if (job.status == 'checked') {
      job.status = 'pending repair payment';
      await job.save();
      await paymentCollection.create({
        invoiceId: invoice.id,
        externalId: externalId,
        jobId: jobId,
        type: 'repair',
        payerId: payerId,
        receiverId: receiverId,
        subAccountId: technician.subAccountId,
        amount: invoice.amount,
        status: invoice.status,
      });
      emitToJobParties('job:pending-repair', job, {
        jobId: job._id,
        status: job.status,
      });
    }

    return res.status(200).json({ success: true, invoices: invoice });
  } catch (err) {
    console.error(err.invoice?.data || err);
    return res.status(500).json(err.invoice?.data || err.message);
    next(err);
  }
};

const getInvoices = async (req, res, next) => {
  // client
  try {
    const { userId } = req.params;

    const invoiceData = await paymentCollection.find({
      $or: [{ payerId: userId }, { receiverId: userId }],
    });

    const payments = invoiceData.map(async (data) => {
      const invoice = await getInvoiceRequest(
        data.invoiceId,
        data.subAccountId,
      );

      console.log('get invoice : ', invoice);

      // if(data.status == 'PENDING'){
      data.status = invoice.status;
      await data.save();
      // }
      const job = await jobsCollection.findById(data.jobId);

      if (invoice.status == 'EXPIRED') {
        job.status = 'canceled';
        await job.save();
      }
      if (
        invoice.status == 'SETTLED' &&
        (job.transferStatus.transportation == false ||
          job.transferStatus.repair == false)
      ) {
        await processTransfer(job._id);
      }
      // return invoice
      return {
        id: invoice.id,
        jobId: data.jobId,
        external_id: invoice.external_id,
        status: data.status,
        type: data.type,
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
      };
    });
    const results = await Promise.all(payments);

    console.log('results invoices : ', results);

    return res.status(200).json({
      success: true,
      invoices: results,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    next(error);
  }
};

const getInvoicesByJobId = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    let payment = await paymentCollection.findOne({
      jobId,
      type: 'repair',
    });

    // jika repair tidak ada
    if (!payment) {
      payment = await paymentCollection.findOne({
        jobId,
        type: 'transportation',
      });
    }

    return res.status(200).json({
      success: true,
      payment: payment,
    });
  } catch (error) {
    next(error);
  }
};

const processTransfer = async (jobId) => {
  const job = await jobsCollection.findById(jobId);
  if (!job) return;

  const payments = await paymentCollection.find({ jobId });

  const transportationPayment = payments.find(
    (p) => p.type === 'transportation',
  );
  const repairPayment = payments.find((p) => p.type === 'repair');

  // transportation transfer

  if (
    transportationPayment &&
    transportationPayment.status === 'SETTLED' &&
    !job.transferStatus.transportation &&
    isValidTransfer(job.status, 'transportation')
  ) {
    // buat data transfer
    
    await createTransfer(
      job._id,
      transportationPayment.receiverId,
      'transportation',
    );

    job.transferStatus.transportation = true;
    await job.save();
  }

  console.log('repair payment : ', repairPayment);
  
  // repair transfer
  if (
    repairPayment &&
    repairPayment.status === 'SETTLED' &&
    !job.transferStatus.repair &&
    isValidTransfer(job.status, 'repair')
  ) {
    await createTransfer(job._id, repairPayment.receiverId, 'repair');

    job.transferStatus.repair = true;
    await job.save();
  }
};
const createTransfer = async (jobId, receiverId, type) => {
  try {
    const referenceId = `trf-${Date.now()}`;
    const sourceUserId = process.env.PLATFORM_ACCOUNT_ID;
    const adminFee = 500;

    const user = await userCollection.findById(receiverId);
    const payment = await paymentCollection.findOne({
      jobId: jobId,
      type: type == 'transfer' ? 'repair' : 'transportation',
      status: { $in: ['PAID', 'SETTLED'] },
    });

    const payload = {
      reference: referenceId,
      amount:
        payment.type == 'repair'
          ? (payment.amount - adminFee) * 0.5
          : payment.amount * 0.5,

      source_user_id: sourceUserId,
      destination_user_id: user.subAccountId,
    };

    if (payment) {
      const transfer = await createTransferRequest(payload);
      console.log('transfer : ', transfer);

      await transfersCollection.create({
        referenceId: transfer.reference,
        status: transfer.status,
        paymentId: payment._id,
        receiverId: receiverId,
        type: payment.type,
        amount: transfer.amount,
      });
    }
  } catch (error) {
    console.error('error transfer : ', error);
  }
};

const syncInvoices = async () => {
  const payments = await paymentCollection.find({
    status: { $in: ['PAID', 'SETTLED'] },
  });

  for (const payment of payments) {
    const invoice = await getInvoiceRequest(payment.invoiceId);

    if (payment.status !== invoice.status) {
      payment.status = invoice.status;
      await payment.save();

      if (invoice.status === 'SETTLED') {
        await processTransfer(payment.jobId);
      }
    }
  }
};
const getTransfer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // const user = await userCollection.findById(userId)
    const field = role === 'technician' ? 'receiverId' : 'payerId';

    const payments = await paymentCollection.find({
      [field]: userId,
      status: { $in: ['PAID', 'SETTLED'] },
    });

    if (!payments) {
      return res.status(404).json({
        success: false,
        message: 'pembayaran untuk job ini tidak ditemukan atau belum dibayar',
      });
    }
    // const paymentIds = payments.map((p) => p._id);

    const paymentMap = new Map(payments.map((p) => [p._id.toString(), p]));

    const transfers = await transfersCollection.find({
      // paymentId: { $in: paymentIds },
      receiverId: userId,
      status: 'SUCCESSFUL',
    });

    const transfersRequest = transfers.map(async (transfer) => {
      const transferDetail = await getTransferRequest(transfer.referenceId);

      const payment = paymentMap.get(transfer.paymentId.toString());

      return {
        ...transferDetail, // data dari Xendit

        paymentId: transfer.paymentId,
        jobId: payment?.jobId,
        type: payment?.type,
        amount: transfer.amount,
        // receiverId: payment?.receiverId
      };
    });
    const transferResults = await Promise.all(transfersRequest);

    // console.log('transfer request : ', transfersRequest);

    if (!transfers) {
      return res.status(404).json({
        success: false,
        message: 'transfer untuk job ini tidak ditemukan',
      });
    }
    return res.status(200).json({
      success: true,
      transfers: transferResults,
    });
  } catch (error) {
    next(error);
  }
};

const checkBalance = async (req, res, next) => {
  // teknisi
  try {
    const { subAccountId } = req.params;

    const response = await checkBalanceRequest(subAccountId);

    // console.log('balance : ', response);
    return res.status(200).json({
      success: true,
      balance: response.balance,
    });
  } catch (error) {
    next(error);
  }
};

const createDisbursements = async (req, res, next) => {
  // teknisi
  try {
    const { userId, amount, channelName, accountNumber } = req.body;
    const referenceId = `disb-${Date.now()}`;
    const channelCode = `ID_${channelName}`;
    console.log(`debug payout : ${userId}, ${amount}, ${channelCode}`);

    const user = await userCollection.findById(userId);
    if (!user || !user.subAccountId) {
      return res.status(404).json({
        success: false,
        message: 'Teknisi tidak ditemukan atau belum memiliki sub account',
      });
    }

    const paymentChannels = await getPayoutsChannels(channelCode);
    console.log('payment channels : ', paymentChannels);

    let minimumLimits = paymentChannels[0].amount_limits.minimum;
    let maximumLimits = paymentChannels[0].amount_limits.maximum;

    if (amount < minimumLimits || amount > maximumLimits) {
      return res.status(200).json({
        success: false,
        minimumLimits,
        maximumLimits,
        message: `minimum nilai transaksi adalah Rp ${minimumLimits} dan maksimal Rp ${maximumLimits}`,
      });
    }
    const userBalance = await checkBalanceRequest(user.subAccountId);

    if (userBalance.balance < amount) {
      return res.status(200).json({
        success: false,
        message: 'saldo tidak mencukupi',
      });
    }

    const date = new Date();
    const payload = {
      reference_id: referenceId,
      subAccountId: user.subAccountId,
      external_id: referenceId,
      bank_code: channelName,
      account_holder_name: user.nama,
      account_number: accountNumber,
      description: `Payout tgl ${date.toLocaleDateString()}`,
      amount: amount,
    };

    const payout = await createDisbursementsRequest(payload);
    console.log('payout : ', payout);

    await payoutCollection.create({
      payoutId: payout.id,
      userId: user._id,
      amount: payout.amount,
      channelCode: payout.bank_code,
      referenceId: payout.external_id,
      status: payout.status,
    });

    return res.status(200).json({
      success: true,
      message: 'berhasil melakukan penarikan saldo',
      payout: payout.data,
    });
  } catch (error) {
    next(error);
  }
};

const getDisbursements = async (req, res, next) => {
  try {
    const { technicianId } = req.params;
    const payouts = await payoutCollection.find({ userId: technicianId });
    if (payouts.length == 0) {
      return res.status(404).json({
        success: false,
        message: 'payout untuk teknisi ini tidak ditemukan',
      });
    }
    // console.log('payouts : ', payouts);

    const payoutDetails = payouts.map(async (payout) => {
      const technician = await userCollection.findById(payout.userId);

      const latestDisbursements = await getDisbursementsRequest(
        payout.payoutId,
        technician.subAccountId,
      );
      payout.status = latestDisbursements.status;
      await payout.save();

      return latestDisbursements;
    });

    const resolvedPayoutDetails = await Promise.all(payoutDetails);

    // console.log('payouts detail : ', resolvedPayoutDetails);

    return res.status(200).json({
      success: true,
      disbursements: resolvedPayoutDetails,
    });
  } catch (error) {
    next(error);
  }
};

const autoTransfer = async () => {
  try {
    const referenceId = `trf-${Date.now()}`;
    const sourceUserId = process.env.PLATFORM_ACCOUNT_ID;
    console.log('Cek job untuk auto transfer...');

    const FOUR_DAYS = 4 * 24 * 60 * 60 * 1000;
    const nowDays = new Date();
    const fourDaysAgo = new Date(nowDays.getTime() - FOUR_DAYS);

    console.log('for days ago', fourDaysAgo);
    const jobs = await jobsCollection.find({
      status: 'warranty',
      jobDoneDate: { $lte: fourDaysAgo },
      'transferStatus.repair': false,
    });

    for (const job of jobs) {
      // antisipasi double transfer
      const locked = await jobsCollection.findOneAndUpdate(
        {
          _id: job._id,
          'transferStatus.repair': false,
        },
        {
          $set: {
            'transferStatus.repair': true,
          },
        },
        {
          new: true,
        },
      );

      if (!locked) continue;

      const payment = await paymentCollection.findOne({
        jobId: job._id,
        status: 'SETTLED',
        type: 'repair',
      });

      const technician = await userCollection.findById(job.selectedTechnician);

      if (!payment) {
        console.log('Payment belum ada / belum PAID');
        continue;
      }
      const payload = {
        reference: referenceId,
        amount: payment.amount,
        source_user_id: sourceUserId,
        destination_user_id: technician.subAccountId,
      };
      const transfer = await createTransferRequest(payload);
      await transfersCollection.create({
        referenceId: transfer.reference,
        status: transfer.status,
        paymentId: payment._id,
        receiverId: technician._id,
        type: 'payment',
        amount: transfer.amount,
      });

      job.status = 'completed';
      job.transferStatus.repair = true;
      job.save();

      console.log('data payment : ', payment);
    }
  } catch (error) {
    console.error('terjadi kesalahan : ', error);
  }
};

const handleXenditWebhooksInvoices = async (req, res) => {
  // xendit execution
  // try {
  const event = req.body;

  console.log('event1 : ', event);

  const id = event.id;

  // const amount = Number(event.amount);
  const payment = await paymentCollection.findOne({
    invoiceId: id,
  });
  payment.status = event.status;
  await payment.save();

  await processTransfer(payment.jobId);

  const job = await jobsCollection.findById(payment.jobId);

  if (
    event.status == 'PAID' &&
    payment.type === 'transportation' &&
    job.status == 'pending transport fee'
  ) {
    job.status = 'transport fee paid';
    await job.save();

    emitToJobParties('job:paid-transport', job, {
      jobId: job._id,
      status: job.status,
    });
  } else if (
    event.status == 'PAID' &&
    payment.type === 'repair' &&
    job.status == 'pending repair payment'
  ) {
    job.status = 'repair paid';
    await job.save();
    emitToJobParties('job:paid-repair', job, {
      jobId: job._id,
      status: job.status,
    });
  }
  return res.status(200).send('OK');
};

const handleXenditWebhooksPayout = async (req, res) => {
  try {
    console.log('event : ', req.body);
    const payout = await payoutCollection.findOne({
      referenceId: req.body.external_id,
    });
    payout.status = req.body.status;
    await payout.save();
    return res.status(200).send('OK');
  } catch (error) {
    return res.status(500).send('ERR');
  }
};

export {
  checkBalance,
  createInvoice,
  handleXenditWebhooksInvoices,
  createDisbursements,
  getDisbursements,
  getInvoices,
  processTransfer,
  syncInvoices,
  getInvoicesByJobId,
  createTransfer,
  getTransfer,
  autoTransfer,
  handleXenditWebhooksPayout,
};
