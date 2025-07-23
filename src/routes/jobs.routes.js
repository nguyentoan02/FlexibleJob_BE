import express from "express";
import {
    fetchJobList,
    fetchJobDetail,
    reportJobController,
    hideJobController,
    unhideJobController,
} from "../controllers/joblist.controller.js";
import { optionalAuth, isRole } from "../middlewares/auth.middleware.js";
import auth from "../middlewares/auth.middleware.js";
import { getJobseekerStats } from "../controllers/joblist.controller.js";

const router = express.Router();

// Route lấy danh sách job
router.get("/", fetchJobList);

// Route lấy chi tiết job
router.get("/:jobId", optionalAuth, fetchJobDetail);

// Người dùng gửi báo cáo job
router.post("/:jobId/report", auth, reportJobController);

// Admin ẩn job
router.patch("/:jobId/hide", auth, isRole("ADMIN"), hideJobController);

// Admin bỏ ẩn job
router.patch("/:jobId/unhide", auth, isRole("ADMIN"), unhideJobController);

// Route lấy thống kê dashboard cho jobseeker
router.get(
    "/my-applications/stats",
    auth,
    isRole("JOBSEEKER"),
    getJobseekerStats
);

export default router;
