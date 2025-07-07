import { getJobList, getJobDetail } from "../service/joblist.service.js";

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
