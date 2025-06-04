import {
    createJobForCompany,
    expireJob,
    getAllAvailableJobs,
} from "../service/jobs.service.js";

export const getAllJob = async (req, res) => {
    const { page, limit } = req.query;
    const result = await getAllAvailableJobs(page, limit);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const createJob = async (req, res) => {
    const { companyId } = req.params;
    const {
        category,
        title,
        description,
        requirements,
        benefits,
        experienceYears,
        level,
        jobType,
        location,
        isRemote,
        salary,
        deadline,
    } = req.body;
    const result = await createJobForCompany(
        companyId,
        category,
        title,
        description,
        requirements,
        benefits,
        experienceYears,
        level,
        jobType,
        location,
        isRemote,
        salary,
        deadline
    );
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const getJobByCompany = async (req, res) => {
    const { companyId } = req.params;
    const result = await getJobByCompany(companyId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const handleExpireJob = async (req, res) => {
    const { jobId } = req.params;
    const result = await expireJob(jobId, true);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};
