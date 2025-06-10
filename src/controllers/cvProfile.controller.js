// src/controllers/cvProfile.controller.js
import {
    createOrUpdateCvProfile, // **ĐỔI TÊN HÀM NÀY**
    // getAllCvProfilesByUser, // **CÓ THỂ LOẠI BỎ NẾU CHỈ CÓ 1 CV/USER**
    getMyCvProfile,
    updateCvProfile,
    deleteCvProfile,
    // Bạn có thể cần thêm các hàm cho Education/Experience nếu có
    addEducationToCv,
    updateEducationInCv,
    removeEducationFromCv,
    addExperienceToCv,
    updateExperienceInCv,
    removeExperienceFromCv,
} from "../service/cvProfile.service.js"; // Đường dẫn phải là "../service/" chứ không phải "../services/" nếu tên folder là "service"

const handleResponse = (res, serviceResponse) => {
    return res.status(serviceResponse.code).json(serviceResponse);
};

// [POST] /api/cv-profiles
// Hàm này sẽ tạo mới hoặc cập nhật CV Profile của người dùng
export const createMyCvProfile = async (req, res) => {
    const userId = req.user.id;
    const cvProfileData = req.body;
    const pdfFile = req.file;

    // Validation file PDF (đã có, giữ nguyên)
    if (!pdfFile) {
        return res.status(400).json({ message: "No PDF file uploaded." });
    }
    console.log("MIME type received for PDF upload:", pdfFile.mimetype);
    if (pdfFile.mimetype !== "application/pdf") {
        return res
            .status(400)
            .json({ message: "Only PDF files are allowed for CV Profile." });
    }

    try {
        // **Gọi hàm service đã đổi tên**
        const response = await createOrUpdateCvProfile(
            userId,
            cvProfileData,
            pdfFile
        );
        handleResponse(res, response);
    } catch (error) {
        console.error("Error in createMyCvProfile controller:", error);
        res.status(500).json({
            message: "Internal server error during CV creation/update.",
        });
    }
};

// [GET] /api/cv-profiles
// Controller này sẽ lấy CV Profile duy nhất của người dùng hiện tại
export const getMyCvProfileDetail = async (req, res) => {
    const userId = req.user.id;
    const response = await getMyCvProfile(userId); // Gọi service lấy CV của user hiện tại
    handleResponse(res, response);
};

// **LOẠI BỎ HÀM NÀY NẾU CHỈ CÓ 1 CV/USER:**
/*
export const getMyCvProfilesList = async (req, res) => {
    const userId = req.user.id;
    const response = await getAllCvProfilesByUser(userId);
    handleResponse(res, response);
};
*/

// ... (các hàm updateMyCvProfile, deleteMyCvProfile giữ nguyên)

// [POST] /api/cv-profiles/:id/education
export const addMyEducation = async (req, res) => {
    const cvProfileId = req.params.id;
    const userId = req.user.id;
    const educationData = req.body;

    console.log("Received educationData:", educationData); // THÊM DÒNG NÀY ĐỂ DEBUG

    // Thêm kiểm tra sơ bộ dữ liệu nhận được
    if (
        !educationData ||
        !educationData.school ||
        !educationData.degree ||
        !educationData.startDate
    ) {
        return res
            .status(400)
            .json({ message: "Missing required education fields." });
    }

    try {
        const response = await addEducationToCv(
            cvProfileId,
            userId,
            educationData
        );
        handleResponse(res, response);
    } catch (error) {
        console.error("Error in addMyEducation controller:", error);
        res.status(500).json({
            message: "Internal server error during adding education.",
        });
    }
};

// [PUT] /api/cv-profiles/:id/education/:eduId
export const updateMyEducation = async (req, res) => {
    const cvProfileId = req.params.id;
    const educationId = req.params.eduId;
    const userId = req.user.id;
    const updateData = req.body;
    const response = await updateEducationInCv(
        cvProfileId,
        educationId,
        userId,
        updateData
    );
    handleResponse(res, response);
};

// [DELETE] /api/cv-profiles/:id/education/:eduId
export const deleteMyEducation = async (req, res) => {
    const cvProfileId = req.params.id;
    const educationId = req.params.eduId;
    const userId = req.user.id;
    const response = await removeEducationFromCv(
        cvProfileId,
        educationId,
        userId
    );
    handleResponse(res, response);
};

// [POST] /api/cv-profiles/:id/experience
export const addMyExperience = async (req, res) => {
    const cvProfileId = req.params.id;
    const userId = req.user.id;
    const experienceData = req.body;
    const response = await addExperienceToCv(
        cvProfileId,
        userId,
        experienceData
    );
    handleResponse(res, response);
};

// [PUT] /api/cv-profiles/:id/experience/:expId
export const updateMyExperience = async (req, res) => {
    const cvProfileId = req.params.id;
    const experienceId = req.params.expId;
    const userId = req.user.id;
    const updateData = req.body;
    const response = await updateExperienceInCv(
        cvProfileId,
        experienceId,
        userId,
        updateData
    );
    handleResponse(res, response);
};

// [DELETE] /api/cv-profiles/:id/experience/:expId
export const deleteMyExperience = async (req, res) => {
    const cvProfileId = req.params.id;
    const experienceId = req.params.expId;
    const userId = req.user.id;
    const response = await removeExperienceFromCv(
        cvProfileId,
        experienceId,
        userId
    );
    handleResponse(res, response);
};

// Add these functions back if they were removed or commented out
export const updateMyCvProfile = async (req, res) => {
    const cvProfileId = req.params.id;
    const userId = req.user.id;
    const updateData = req.body;
    const pdfFile = req.file; // This handles if a new PDF is uploaded
    const response = await updateCvProfile(
        cvProfileId,
        userId,
        updateData,
        pdfFile
    );
    handleResponse(res, response);
};

export const deleteMyCvProfile = async (req, res) => {
    const cvProfileId = req.params.id;
    const userId = req.user.id;
    const response = await deleteCvProfile(cvProfileId, userId);
    handleResponse(res, response);
};
