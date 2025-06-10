// src/controllers/application.controller.js
import { applyForJob } from "../service/application.service.js"; // Chỉ import hàm applyForJob

const handleResponse = (res, serviceResponse) => {
    return res.status(serviceResponse.code).json(serviceResponse);
};

// [POST] /api/applications/apply/:jobId
export const applyToJob = async (req, res) => {
    const userId = req.user.id; // Lấy từ token của JOBSEEKER
    const jobId = req.params.jobId;
    const { cvProfileId, noted } = req.body;

    // Validation input cơ bản
    if (!cvProfileId) {
        return res
            .status(400)
            .json({ message: "CV Profile ID is required to apply." });
    }

    const response = await applyForJob(userId, jobId, cvProfileId, noted);
    handleResponse(res, response);
};

// Loại bỏ tất cả các controller khác: getMyAllApplications, getMyApplicationDetail, withdrawMyApplication, getApplicationsForJob, updateApplicationStatusByEmployer
