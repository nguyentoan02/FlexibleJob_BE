// src/routes/application.routes.js
import express from "express";
import auth, { isRole } from "../middlewares/auth.middleware.js";
import { applyToJob, getMyApplicationsList } from "../controllers/applications.controller.js";

const router = express.Router();

// Route nộp đơn ứng tuyển
router.post("/apply/:jobId", auth, isRole("JOBSEEKER"), applyToJob);

// Route mới để lấy danh sách đơn ứng tuyển
router.get("/my-applications", auth, isRole("JOBSEEKER"), getMyApplicationsList);

export default router;
