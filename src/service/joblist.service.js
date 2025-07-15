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
            .populate("company", "companyName location imageUrl") // Include imageUrl
            .populate("category", "categoryName");

        const totalJobs = await Job.countDocuments({ isExpired: false });
        const payload = {
            jobs,
            totalPages: Math.ceil(totalJobs / limit),
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
            .populate("company", "companyName aboutUs location imageUrl")
            .populate("category", "categoryName");

        if (!job) {
            return dataResponse(404, "Job not found", null);
        }

        const hasApplied = await Application.exists({
            job: jobId,
            user: userId,
        });

        const applicantCount = await Application.countDocuments({ job: jobId });

        const companyId = job.company._id;

        // Fetch the active jobs for the company
        const activeJobs = await Job.find({
            company: companyId,
            isExpired: false,
            _id: { $ne: jobId }, // Exclude the current job
        }).limit(5); // Limit to a reasonable number

        const activeJobsCount = activeJobs.length;

        const companyJobsMessage =
            activeJobsCount > 0
                ? `This company has ${activeJobsCount} active job(s).`
                : "This company currently has no active jobs.";

        const payload = {
            ...job.toObject(),
            hasApplied: !!hasApplied,
            applicantCount,
            companyJobsMessage,
            activeJobs, // Add the active jobs to the payload
        };

        return dataResponse(200, "Job detail fetched successfully", payload);
    } catch (error) {
        console.error("Error in getJobDetail service:", error);
        return dataResponse(500, "Failed to fetch job detail", null);
    }
};

// Người dùng gửi báo cáo job
export const reportJob = async (jobId, userId, reason) => {
    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return dataResponse(404, "Job not found", null);
        }
        job.reports.push({
            user: userId,
            reason,
            reportedAt: new Date(),
        });
        await job.save();
        return dataResponse(200, "Report submitted successfully", null);
    } catch (error) {
        console.error("Error in reportJob service:", error);
        return dataResponse(500, "Failed to report job", null);
    }
};

// Admin ẩn job
export const hideJob = async (jobId) => {
    try {
        const job = await Job.findByIdAndUpdate(
            jobId,
            { isHidden: true },
            { new: true }
        );
        if (!job) {
            return dataResponse(404, "Job not found", null);
        }
        return dataResponse(200, "Job hidden successfully", job);
    } catch (error) {
        console.error("Error in hideJob service:", error);
        return dataResponse(500, "Failed to hide job", null);
    }
};
