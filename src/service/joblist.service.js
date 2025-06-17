import Job from "../models/jobs.model.js";
import Application from "../models/application.model.js";
const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

// Lấy danh sách job
export const getJobList = async (page = 1, limit = 10) => {
    try {
        const jobs = await Job.find({ isExpired: false })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ datePosted: -1 })
            .populate("company", "companyName location")
            .populate("category", "categoryName");

        const totalJobs = await Job.countDocuments({ isExpired: false });
        const payload = {
            jobs,
            totalPage: Math.ceil(totalJobs / limit),
            currentPage: page,
        };

        return dataResponse(200, "Job list fetched successfully", payload);
    } catch (error) {
        console.error("Error in getJobList service:", error);
        return dataResponse(500, "Failed to fetch job list", null);
    }
};

// Lấy chi tiết job
export const getJobDetail = async (jobId, userId) => {
    try {
        const job = await Job.findById(jobId)
            .populate("company", "companyName aboutUs location")
            .populate("category", "categoryName");

        if (!job) {
            return dataResponse(404, "Job not found", null);
        }

        // Check if the user has already applied for this job
        const hasApplied = await Application.exists({
            job: jobId,
            user: userId,
        });

        const payload = {
            ...job.toObject(),
            hasApplied: !!hasApplied, // Add the flag
        };

        return dataResponse(200, "Job detail fetched successfully", payload);
    } catch (error) {
        console.error("Error in getJobDetail service:", error);
        return dataResponse(500, "Failed to fetch job detail", null);
    }
};
