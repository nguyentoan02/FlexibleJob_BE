import Application from "../models/application.model.js";
import Job from "../models/jobs.model.js";
import User from "../models/user.model.js";
import CvProfile from "../models/cvprofile.model.js"; // SỬA Ở ĐÂY
import {
    getMatchScoreFromAI,
    getComparativeAnalysisFromAI,
} from "./openai.service.js";
import { createNotification } from "./notification.service.js";

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

        const job = await Job.findById(jobId).populate({
            path: "company",
            select: "user",
        });
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

        // await scoreApplicationInBackground(newApplication._id);

        // Gửi thông báo cho nhà tuyển dụng
        const companyOwnerId = job.company.user;
        if (companyOwnerId) {
            await createNotification(
                companyOwnerId,
                `Ứng viên ${user.firstName} ${user.lastName} vừa nộp đơn vào vị trí ${job.title}.`,
                "APPLICATION_SUBMITTED",
                `/company/applications` // Hoặc link đến trang quản lý ứng viên
            );
        }

        // Gửi thông báo xác nhận cho ứng viên
        await createNotification(
            userId,
            `Bạn đã nộp đơn thành công vào vị trí ${job.title}.`,
            "APPLICATION_SUCCESS",
            "/jobseeker/applications"
        );

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
            .populate({
                path: "job",
                select: "title company",
                populate: {
                    path: "company",
                    select: "companyName location",
                },
            })
            .populate({
                path: "cv",
                model: "CvProfile",
                select: "linkUrl skills education experience certifications",
            })
            .populate({
                path: "user",
                select: "firstName lastName email imageUrl",
            })
            .sort({ applicationDate: -1 })
            .lean();

        // Luôn trả về mảng, không trả về 404
        return dataResponse(
            200,
            "Applications retrieved successfully",
            applications.map((app) => ({
                ...app,
                cvSnapshot: app.cvSnapshot,
            }))
        );
    } catch (error) {
        console.error("Error in getMyApplications service:", error);
        return dataResponse(500, `Server error: ${error.message}`, []);
    }
};

export const changeStatus = async (appId, action, note) => {
    try {
        // If appId is an object, extract the actual id string
        const id =
            typeof appId === "object" && appId.applicationId
                ? appId.applicationId
                : appId;
        const app = await Application.findByIdAndUpdate(
            id,
            { status: action, noted: note },
            { new: true }
        ).populate("user job");
        if (!app) {
            return dataResponse(404, "can not find this application", null);
        }

        // Gửi thông báo cho ứng viên
        const statusText = {
            REJECTED: "bị từ chối",
            HIRED: "được tuyển",
        };

        if (app.user && statusText[action]) {
            await createNotification(
                app.user._id,
                `Đơn ứng tuyển của bạn cho vị trí "${app.job.title}" đã ${statusText[action]}.`,
                "APPLICATION_STATUS_CHANGED",
                "/jobseeker/applications"
            );
        }

        return dataResponse(200, "success", app);
    } catch (error) {
        console.log(error.message);
        return dataResponse(500, error.message, null);
    }
};

// const scoreApplicationInBackground = async (applicationId) => {
//     try {
//         const application = await Application.findById(applicationId);
//         if (!application) {
//             console.log(
//                 `Scoring failed: Application ${applicationId} not found.`
//             );
//             return;
//         }

//         const job = await Job.findById(application.job);
//         const cv = application.cvSnapshot;

//         if (!job || !cv) {
//             console.log(
//                 `Scoring failed: Job or CV data missing for application ${applicationId}.`
//             );
//             return;
//         }

//         const jobDescriptionText = `Job Title: ${job.title}. Salary: ${
//             job.salary
//         }. Location: ${job.location}. Skills required: ${job.requirements.join(
//             ", "
//         )}. Description: ${job.description}.`;
//         const cvContentText = `Candidate's Skills: ${cv.skills.join(
//             ", "
//         )}. Experience: ${cv.experience
//             .map((e) => `${e.title} at ${e.company} - ${e.description}`)
//             .join(". ")}. Education: ${cv.education
//             .map((e) => `${e.degree} at ${e.school}`)
//             .join(". ")}.`;

//         const aiResult = await getMatchScoreFromAI(
//             jobDescriptionText,
//             cvContentText
//         );

//         if (aiResult && aiResult.score) {
//             application.matchScore = aiResult.score;
//             application.scoreJustification = aiResult.justification;
//             await application.save();
//             console.log(
//                 `Successfully scored application ${applicationId} with score: ${aiResult.score}`
//             );
//         } else {
//             console.log(
//                 `AI did not return a valid score for application ${applicationId}.`
//             );
//         }
//     } catch (error) {
//         console.error(
//             `❌ Failed to score application ${applicationId}:`,
//             error
//         );
//     }
// };

export const analyzeApplicantsForJob = async (jobId) => {
    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return dataResponse(404, "Job not found", null);
        }

        const applications = await Application.find({
            job: jobId,
        })
            .populate({
                path: "user",
                select: "firstName lastName imageUrl",
            })
            .sort({ matchScore: -1 })
            .limit(10);

        if (applications.length < 2) {
            return dataResponse(
                400,
                "Not enough scored applicants to compare.",
                null
            );
        }

        const applicantsData = applications
            .map(
                (app) =>
                    `Applicant ID: ${app._id},
                    firstName:${app.user.firstName}, lastName:${app.user.lastName}, image:${app.user.imageUrl}, skill:${app.cvSnapshot.skills}, education: ${app.cvSnapshot.education}, experience: ${app.cvSnapshot.experience}, cvDescription: ${app.cvSnapshot.description}, certifications: ${app.cvSnapshot.certifications}
                `
            )
            .join("\n\n");

        const jobDescriptionText = `Job Title: ${job.title}. Description: ${job.description}. requirements: ${job.requirements}. Level: ${job.level}. Experience Years: ${job.experienceYears}`;

        const analysisResult = await getComparativeAnalysisFromAI(
            jobDescriptionText,
            applicantsData
        );

        if (!analysisResult) {
            return dataResponse(500, "Failed to get analysis from AI.", null);
        }

        return dataResponse(200, "Analysis successful", analysisResult);
    } catch (error) {
        console.error("Error in analyzeApplicantsForJob service:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};
