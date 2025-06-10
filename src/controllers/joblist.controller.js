import { getJobList, getJobDetail } from "../service/joblist.service.js";

export const fetchJobList = async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Lấy page và limit từ query params
    const result = await getJobList(page, limit);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const fetchJobDetail = async (req, res) => {
    const { jobId } = req.params; // Lấy jobId từ URL params
    const result = await getJobDetail(jobId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};
