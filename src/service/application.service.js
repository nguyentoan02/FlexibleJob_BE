import Application from "../models/application.model.js";
import Job from "../models/jobs.model.js";
import User from "../models/user.model.js";
import CvProfile from "../models/cvProfile.model.js"; // Đảm bảo import đúng tên file

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

        // Sử dụng CvProfile thay vì CVProfile
        const cv = await CvProfile.findById(cvProfileId).lean();
        if (!cv || cv.user.toString() !== userId) {
            return dataResponse(
                403,
                "Invalid CV Profile or CV does not belong to the user.",
                null
            );
        }

        // Kiểm tra đơn trùng lặp
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

        const newApplication = new Application({
            job: jobId,
            cv: cvProfileId,
            cvSnapshot: cv, // <--- Lưu snapshot tại đây
            user: userId,
            noted: noted,
            status: "APPLIED",
        });

        await newApplication.save();
        user.applications.push(newApplication._id);
        await user.save();
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

/**
 * Lấy danh sách đơn ứng tuyển của một người dùng
 */
export const getMyApplications = async (userId) => {
    try {
        const applications = await Application.find({ user: userId })
            .populate("job", "title company")
            .populate({
                path: "cv",
                model: "CvProfile",
                select: "linkUrl",
            })
            .populate({
                path: "job",
                populate: {
                    path: "company",
                    select: "companyName location",
                },
            })
            .sort({ applicationDate: -1 })
            .lean(); // <-- Thêm .lean() để trả về plain object

        if (!applications || applications.length === 0) {
            return dataResponse(404, "No applications found", null);
        }

        // Đảm bảo trả về cả cvSnapshot cho mỗi application
        const applicationsWithCvSnapshot = applications.map((app) => ({
            ...app,
            cvSnapshot: app.cvSnapshot, // đã có sẵn trong document
        }));

        return dataResponse(
            200,
            "Applications retrieved successfully",
            applicationsWithCvSnapshot
        );
    } catch (error) {
        console.error("Error in getMyApplications service:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

export const changeStatus = async (appId, action) => {
    try {
        // If appId is an object, extract the actual id string
        const id =
            typeof appId === "object" && appId.applicationId
                ? appId.applicationId
                : appId;
        const app = await Application.findByIdAndUpdate(
            id,
            { status: action },
            { new: true }
        );
        if (!app) {
            return dataResponse(404, "can not find this application", null);
        }
        return dataResponse(200, "success", app);
    } catch (error) {
        console.log(error.message);
        return dataResponse(500, error.message, null);
    }
};
