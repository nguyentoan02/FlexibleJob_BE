import {
    getJobList,
    getJobDetail,
    reportJob,
    hideJob,
    unhideJob,
} from "../service/joblist.service.js";
import { getJobseekerApplicationStats } from "../service/joblist.service.js";

export const fetchJobList = async (req, res) => {
    const { page = 1, limit = 10, isHidden } = req.query;
    const result = await getJobList(page, limit, isHidden);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

// filepath: e:\WDP301\BoilerPlate\src\controllers\joblist.controller.js
export const fetchJobDetail = async (req, res) => {
    const { jobId } = req.params; // Get jobId from URL params
    const userId = req.user?.id; // Get userId from the authenticated user
    const result = await getJobDetail(jobId, userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

// Người dùng gửi báo cáo job
export const reportJobController = async (req, res) => {
    const { jobId } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;
    if (!reason) {
        return res.status(400).json({ message: "Reason is required" });
    }
    const result = await reportJob(jobId, userId, reason);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

// Admin ẩn job
export const hideJobController = async (req, res) => {
    const { jobId } = req.params;
    const result = await hideJob(jobId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

// Admin hiện job
export const unhideJobController = async (req, res) => {
    const { jobId } = req.params;
    const result = await unhideJob(jobId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const getJobseekerStats = async (req, res) => {
    const userId = req.user.id;
    const { period, startDate, endDate } = req.query; // Thêm dòng này

    const result = await getJobseekerApplicationStats(
        userId,
        period,
        startDate,
        endDate
    ); // Truyền đầy đủ tham số

    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};
