import {
    createJob,
    updateJob,
    getCompanyJobs,
    getJobById,
} from "../service/managejob.service.js";

export const createJobController = async (req, res) => {
    try {
        const companyId = req.company._id;
        const result = await createJob(companyId, req.body);
        res.status(result.code).json(result);
    } catch (error) {
        console.error("Error in createJobController:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const updateJobController = async (req, res) => {
    try {
        const { jobId } = req.params;
        const companyId = req.company._id;
        const result = await updateJob(jobId, companyId, req.body);
        res.status(result.code).json(result);
    } catch (error) {
        console.error("Error in updateJobController:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const getCompanyJobsController = async (req, res) => {
    try {
        const companyId = req.company._id;
        const result = await getCompanyJobs(companyId);
        res.status(result.code).json(result);
    } catch (error) {
        console.error("Error in getCompanyJobsController:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const getJobByIdController = async (req, res) => {
    try {
        const { jobId } = req.params;
        const companyId = req.company._id;
        const result = await getJobById(jobId, companyId);
        res.status(result.code).json(result);
    } catch (error) {
        console.error("Error in getJobByIdController:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
