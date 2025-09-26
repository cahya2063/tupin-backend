import mongoose from "mongoose";
import mongoos from "../utils/db.js";

const notificationSchema = new mongoos.Schema({
  userId: {
    type: String,
    required: true 
  }, // penerima notifikasi (technician)
  jobId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }, // status notifikasi
  createdAt: { type: Date, default: Date.now }
});

const notificationCollection = mongoos.model('notifications', notificationSchema)
export default notificationCollection