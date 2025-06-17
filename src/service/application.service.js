// src/services/application.service.js
import Application from "../models/application.model.js";
import Job from "../models/jobs.model.js"; // Đảm bảo đường dẫn đúng: job.model.js hoặc jobs.model.js
import User from "../models/user.model.js";
import CVProfile from "../models/cvprofile.model.js"; // Đảm bảo đường dẫn đúng

// Hàm hỗ trợ định dạng response
const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

/**
 * Nộp đơn ứng tuyển cho một công việc.
 * @param {string} userId - ID của người dùng (JOBSEEKER) nộp đơn.
 * @param {string} jobId - ID của công việc.
 * @param {string} cvProfileId - ID của CV Profile mà người dùng muốn sử dụng.
 * @param {string} [noted] - Ghi chú thêm từ ứng viên (tùy chọn).
 * @returns {Promise<Object>} - Đối tượng dataResponse.
 */
export const applyForJob = async (userId, jobId, cvProfileId, noted = "") => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return dataResponse(404, "User not found.", null);
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return dataResponse(404, "Job not found.", null);
        }

        const cv = await CVProfile.findById(cvProfileId);
        // Đảm bảo CV thuộc về người dùng hiện tại
        if (!cv || cv.user.toString() !== userId) {
            return dataResponse(
                403,
                "Invalid CV Profile or CV does not belong to the user.",
                null
            );
        }

        // Kiểm tra xem người dùng đã nộp đơn cho công việc này với CV này chưa
        const existingApplication = await Application.findOne({
            user: userId,
            job: jobId,
            cv: cvProfileId,
        });

        if (existingApplication) {
            return dataResponse(
                409,
                "You have already applied for this job with this CV.",
                null
            );
        }

        // Tạo bản ghi Application mới
        const newApplication = new Application({
            job: jobId,
            cv: cvProfileId,
            user: userId,
            noted: noted,
            status: "APPLIED", // Mặc định là APPLIED
        });

        await newApplication.save();

        // Thêm ID của Application vào mảng applications của User
        user.applications.push(newApplication._id);
        await user.save();

        // Thêm ID của Application vào mảng applicants của Job
        job.applicants.push(newApplication._id);
        await job.save();

        return dataResponse(
            201,
            "Application submitted successfully.",
            newApplication
        );
    } catch (error) {
        console.error("Error in applyForJob service:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

// Loại bỏ tất cả các hàm khác: getMyApplications, getApplicationDetail, withdrawApplication, getJobApplications, updateApplicationStatus
