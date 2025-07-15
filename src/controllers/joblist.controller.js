import {
    getJobList,
    getJobDetail,
    reportJob,
    hideJob,
} from "../service/joblist.service.js";

export const fetchJobList = async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Lấy page và limit từ query params
    const result = await getJobList(page, limit);
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
