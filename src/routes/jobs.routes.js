import express from "express";
import {
    fetchJobList,
    fetchJobDetail,
} from "../controllers/joblist.controller.js";

const router = express.Router();

// Route lấy danh sách job
router.get("/", fetchJobList);

// Route lấy chi tiết job
router.get("/:jobId", fetchJobDetail);

export default router;
