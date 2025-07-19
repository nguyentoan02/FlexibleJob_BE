import Job from "../models/jobs.model.js";
import Application from "../models/application.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/auth.util.js";
import mongoose from "mongoose";
const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

// Lấy danh sách job
export const getJobList = async (page = 1, limit = 10, isHidden) => {
    try {
        // Xây dựng filter động
        const filter = { isExpired: false };
        if (typeof isHidden !== "undefined") {
            filter.isHidden = isHidden === "true";
        } else {
            filter.isHidden = { $ne: true };
        }

        const jobs = await Job.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ datePosted: -1 })
            .populate("company", "companyName location imageUrl")
            .populate("category", "categoryName");

        const totalJobs = await Job.countDocuments(filter);
        const payload = {
            jobs,
            totalPages: Math.ceil(totalJobs / limit),
            currentPage: page,
            totalJobs,
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
            isHidden: { $ne: true },
            _id: { $ne: jobId },
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
        ).populate("company");
        if (!job) {
            return dataResponse(404, "Job not found", null);
        }
        // Tìm user tạo job (chủ công ty)
        const company = job.company;
        let user = null;
        if (company && company.user) {
            user = await User.findById(company.user);
        }
        if (user) {
            await sendEmail(
                user.email,
                "Job của bạn đã bị ẩn",
                `Job "${job.title}" đã bị report và bị ẩn bởi admin.`
            );
        }
        return dataResponse(200, "Job hidden successfully", job);
    } catch (error) {
        console.error("Error in hideJob service:", error);
        return dataResponse(500, "Failed to hide job", null);
    }
};

export const unhideJob = async (jobId) => {
    try {
        const job = await Job.findByIdAndUpdate(
            jobId,
            { isHidden: false },
            { new: true }
        ).populate("company");
        if (!job) {
            return dataResponse(404, "Job not found", null);
        }
        // Tìm user tạo job (chủ công ty)
        const company = job.company;
        let user = null;
        if (company && company.user) {
            user = await User.findById(company.user);
        }
        if (user) {
            await sendEmail(
                user.email,
                "Job của bạn đã được bỏ ẩn",
                `Job "${job.title}" đã được admin bỏ ẩn và hiển thị trở lại.`
            );
        }
        return dataResponse(200, "Job unhidden successfully", job);
    } catch (error) {
        console.error("Error in unhideJob service:", error);
        return dataResponse(500, "Failed to unhide job", null);
    }
};

export const getJobseekerApplicationStats = async (
    userId,
    period = "day",
    startDate,
    endDate
) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return {
                code: 400,
                message: "Invalid userId",
                payload: null,
            };
        }

        // Xác định format group theo period
        let dateFormat = "%Y-%m-%d"; // Mặc định theo ngày
        if (period === "week") {
            dateFormat = "%Y-%m-%d"; // Vẫn group theo ngày, nhưng sẽ group theo tuần ở FE
        }
        if (period === "month") {
            dateFormat = "%Y-%m-%d"; // Group theo ngày để FE có thể hiển thị từng ngày trong tháng
        }

        // Build match query
        const match = { user: new mongoose.Types.ObjectId(userId) };
        if (startDate || endDate) {
            match.applicationDate = {};
            if (startDate) match.applicationDate.$gte = new Date(startDate);
            if (endDate) match.applicationDate.$lte = new Date(endDate);
        }

        const total = await Application.countDocuments({ user: userId });
        const applied = await Application.countDocuments({
            user: userId,
            status: "APPLIED",
        });
        const rejected = await Application.countDocuments({
            user: userId,
            status: "REJECTED",
        });
        const hired = await Application.countDocuments({
            user: userId,
            status: "HIRED",
        });

        // Group theo ngày
        const statsByPeriod = await Application.aggregate([
            { $match: match },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: dateFormat,
                            date: "$applicationDate",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return {
            code: 200,
            message: "Jobseeker application stats",
            payload: {
                total,
                applied,
                rejected,
                hired,
                chart: statsByPeriod,
            },
        };
    } catch (error) {
        console.error("Error in getJobseekerApplicationStats:", error);
        return {
            code: 500,
            message: "Failed to get application stats",
            payload: null,
        };
    }
};
