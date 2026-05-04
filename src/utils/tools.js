import { io } from "../index.js";

export const emitToJobParties = (event, job, payload) => {
  io.to(`technician:${job.selectedTechnician}`).emit(event, payload)
  io.to(`client:${job.idCreator}`).emit(event, payload)
}