import { getCompanyByUserId } from "../service/company.service.js";
import {
    createJobForCompany,
    expireJob,
    getAllAvailableJobs,
    getJobByCompanyId,
    getJobs,
    getJobsByUserId,
    getListApplicant,
    updateJobByJobId,
} from "../service/jobs.service.js";
import { removeEmptyFields } from "../utils/handleArray.util.js";

export const getAllJob = async (req, res) => {
    const { page, limit } = req.query;
    const result = await getAllAvailableJobs(page, limit);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const createJob = async (req, res) => {
    const { id } = req.user;
    const companyId = await getCompanyByUserId(id);
    if (!companyId) {
        return res
            .status(companyId.code)
            .json({ message: companyId.message, payload: companyId.payload });
    }
    const data = {
        ...req.body,
        company: companyId.payload._id,
    };
    const result = await createJobForCompany(data);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const getJobByCompany = async (req, res) => {
    const { companyId } = req.params;
    const result = await getJobByCompanyId(companyId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const handleExpireJob = async (req, res) => {
    const { jobId } = req.params;
    const result = await expireJob(jobId, true, Date.now());
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const updateJob = async (req, res) => {
    const { jobId } = req.params;
    const data = {
        ...removeEmptyFields({ ...req.body }),
    };
    const result = await updateJobByJobId(jobId, data);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const viewListApplicant = async (req, res) => {
    const { jobId } = req.params;
    const result = await getListApplicant(jobId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const viewJobsOfCompany = async (req, res) => {
    const { companyId } = req.params;
    const result = await getJobs(companyId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const getJobsByCompany = async (req, res) => {
    try {
        const userId = req.user.id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";

        const result = await getJobsByUserId(userId, page, limit, search);

        res.status(result.code).json({
            message: result.message,
            payload: result.payload,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getJobByJobId = async (req, res) => {
    const { jobId } = req.params;
    const result = await getJobByJobId(jobId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};
