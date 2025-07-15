import express from "express";
import {
    fetchJobList,
    fetchJobDetail,
    reportJobController,
    hideJobController,
} from "../controllers/joblist.controller.js";
import { optionalAuth, isRole } from "../middlewares/auth.middleware.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

// Route lấy danh sách job
router.get("/", fetchJobList);

// Route lấy chi tiết job
router.get("/:jobId", optionalAuth, fetchJobDetail);

// Người dùng gửi báo cáo job
router.post("/:jobId/report", auth, reportJobController);

// Admin ẩn job
router.patch("/:jobId/hide", auth, isRole("ADMIN"), hideJobController);

export default router;
