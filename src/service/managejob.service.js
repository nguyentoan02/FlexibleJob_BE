import Job from "../models/jobs.model.js";

const dataResponse = (code, message, payload) => {
    return {
        code,
        message,
        payload,
    };
};

export const createJob = async (companyId, jobData) => {
    try {
        const job = await Job.create({
            ...jobData,
            company: companyId,
        });

        return dataResponse(201, "Job created successfully", job);
    } catch (error) {
        console.error("Error in createJob service:", error);
        return dataResponse(500, "Failed to create job", null);
    }
};

export const updateJob = async (jobId, companyId, jobData) => {
    try {
        const job = await Job.findOneAndUpdate(
            { _id: jobId, company: companyId },
            jobData,
            { new: true }
        );

        if (!job) {
            return dataResponse(404, "Job not found or unauthorized", null);
        }

        return dataResponse(200, "Job updated successfully", job);
    } catch (error) {
        console.error("Error in updateJob service:", error);
        return dataResponse(500, "Failed to update job", null);
    }
};

export const getCompanyJobs = async (companyId) => {
    try {
        const jobs = await Job.find({ company: companyId })
            .populate("category", "categoryName")
            .sort({ createdAt: -1 });

        return dataResponse(200, "Jobs retrieved successfully", jobs);
    } catch (error) {
        console.error("Error in getCompanyJobs service:", error);
        return dataResponse(500, "Failed to retrieve jobs", null);
    }
};

export const getJobById = async (jobId, companyId) => {
    try {
        const job = await Job.findOne({
            _id: jobId,
            company: companyId,
        }).populate("category", "categoryName");

        if (!job) {
            return dataResponse(404, "Job not found or unauthorized", null);
        }

        return dataResponse(200, "Job retrieved successfully", job);
    } catch (error) {
        console.error("Error in getJobById service:", error);
        return dataResponse(500, "Failed to retrieve job", null);
    }
};
