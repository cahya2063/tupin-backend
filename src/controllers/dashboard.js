import jobsCollection from "../models/jobs.js";
import paymentCollection from "../models/payment.js";
import warrantyCollection from "../models/warranty.js";
import reviewCollection from "../models/review.js";
import reportsCollection from "../models/reports.js";
import userCollection from "../models/users.js";
import SkillCollection from "../models/skills.js";
import { checkBalanceRequest } from "../services/xendit.service.js";
// import mongoose from "mongoose";

// const ObjectId = mongoose.Types.ObjectId;

const getCustomerDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Ringkasan Pesanan (Jobs)
    const allJobs = await jobsCollection.find({ idCreator: userId });
    
    let activeJobsCount = 0;
    let completedJobsCount = 0;
    let canceledJobsCount = 0;

    allJobs.forEach(job => {
      if (job.status === 'completed') {
        completedJobsCount++;
      } else if (job.status === 'canceled') {
        canceledJobsCount++;
      } else {
        activeJobsCount++; // Status selain completed & canceled dianggap aktif
      }
    });

    // 2. Tagihan belum dibayar (Unpaid Invoices)
    const unpaidInvoices = await paymentCollection.countDocuments({
      payerId: userId,
      status: 'PENDING'
    });

    // 3. Garansi Aktif (Warranties)
    // Ambil semua id job milik pelanggan
    const jobIds = allJobs.map(job => job._id);
    const activeWarranties = await warrantyCollection.countDocuments({
      jobId: { $in: jobIds },
      status: 'repairing'
    });

    // 4. Aktivitas Terkini (Recent Jobs)
    const recentJobs = await jobsCollection.find({ idCreator: userId })
      .sort({ _id: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      dashboard: {
        jobSummary: {
          active: activeJobsCount,
          completed: completedJobsCount,
          canceled: canceledJobsCount
        },
        unpaidInvoices,
        activeWarranties,
        recentJobs
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTechnicianDashboard = async (req, res, next) => {
  try {
    const technicianId = req.user.id;
    
    // 1. Ambil data teknisi untuk ambil subAccountId & penaltyPoint
    const technician = await userCollection.findById(technicianId);
    if (!technician) {
      return res.status(404).json({ success: false, message: 'Teknisi tidak ditemukan' });
    }

    // 2. Saldo Xendit (Balance)
    let balance = 0;
    if (technician.subAccountId) {
      try {
        const balanceData = await checkBalanceRequest(technician.subAccountId);
        balance = balanceData.balance || 0;
      } catch (err) {
        console.error("Gagal mengambil saldo Xendit:", err.message);
      }
    }

    // 3. Statistik Review
    const ratingResult = await reviewCollection.aggregate([
      { $match: { receiverId: technicianId } },
      { $group: { _id: '$receiverId', avgRating: { $avg: '$rating' }, totalReview: { $sum: 1 } } }
    ]);
    const avgRating = ratingResult.length > 0 ? Number(ratingResult[0].avgRating.toFixed(1)) : 0;
    const totalReview = ratingResult.length > 0 ? ratingResult[0].totalReview : 0;

    // 4. Manajemen Pekerjaan (Jobs)
    const allJobs = await jobsCollection.find({ selectedTechnician: technicianId });
    
    let incomingJobsCount = 0; 
    let pendingPaymentJobsCount = 0; 
    let warrantyJobsCount = 0; 
    let completedJobsCount = 0; 

    allJobs.forEach(job => {
      if (job.status === 'pending transport fee' || job.status === 'pending repair payment') {
        pendingPaymentJobsCount++;
      } else if (job.status === 'warranty') {
        warrantyJobsCount++;
      } else if (job.status === 'completed') {
        completedJobsCount++;
      } else if (job.status !== 'canceled') {
        incomingJobsCount++;
      }
    });

    return res.status(200).json({
      success: true,
      dashboard: {
        wallet: {
          balance
        },
        statistics: {
          avgRating,
          totalReview,
          completedJobs: completedJobsCount
        },
        jobQueue: {
          incoming: incomingJobsCount,
          pendingPayment: pendingPaymentJobsCount,
          warranty: warrantyJobsCount
        },
        warning: {
          penaltyPoint: technician.penaltyPoint || 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAdminDashboard = async (req, res, next) => {
  try {
    // 1. Teknisi menunggu persetujuan
    const pendingTechnicians = await userCollection.countDocuments({
      role: 'technician',
      status: 'pending'
    });

    // 2. Teknisi bermasalah (Poin penalti >= 50)
    const criticalTechnicians = await userCollection.countDocuments({
      role: 'technician',
      penaltyPoint: { $gte: 50 },
      isActive: true
    });

    // 3. Laporan yang belum diselesaikan (tidak ada status resolved/rejected)
    const pendingReports = await reportsCollection.countDocuments({
      status: { $nin: ['resolved', 'rejected'] }
    });

    // 4. Ringkasan Sistem (Semua Jobs)
    const totalJobs = await jobsCollection.countDocuments();
    const completedJobs = await jobsCollection.countDocuments({ status: 'completed' });
    const canceledJobs = await jobsCollection.countDocuments({ status: 'canceled' });
    const activeJobs = totalJobs - completedJobs - canceledJobs;

    const totalWarranties = await warrantyCollection.countDocuments();
    const totalSkills = await SkillCollection.countDocuments();

    return res.status(200).json({
      success: true,
      dashboard: {
        approvals: {
          pendingTechnicians
        },
        reportsAndPenalty: {
          pendingReports,
          criticalTechnicians
        },
        systemOverview: {
          totalJobs,
          activeJobs,
          completedJobs,
          canceledJobs,
          totalWarranties,
          totalSkills
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export { getCustomerDashboard, getTechnicianDashboard, getAdminDashboard };
