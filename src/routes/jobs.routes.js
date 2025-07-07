import express from "express";
import {
    fetchJobList,
    fetchJobDetail,
} from "../controllers/joblist.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Route lấy danh sách job
router.get("/", fetchJobList);

// Route lấy chi tiết job
router.get("/:jobId", optionalAuth, fetchJobDetail);

export default router;
