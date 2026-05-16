import express from 'express';
import { authRole } from '../middleware/auth.js';
import { getAdminDashboard, getCustomerDashboard, getTechnicianDashboard } from '../controllers/dashboard.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/client', authRole(['client']), getCustomerDashboard);
dashboardRouter.get('/technician', authRole(['technician']), getTechnicianDashboard);
dashboardRouter.get('/admin', authRole(['admin']), getAdminDashboard);

export default dashboardRouter;
