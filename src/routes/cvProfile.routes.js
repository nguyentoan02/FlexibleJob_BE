// src/routes/cvProfile.routes.js
import express from "express";
import multer from "multer";
import auth, { isRole } from "../middlewares/auth.middleware.js";

import {
    createMyCvProfile,
    // getMyCvProfilesList, // **CÓ THỂ LOẠI BỎ NẾU CHỈ CÓ 1 CV/USER**
    getMyCvProfileDetail,
    updateMyCvProfile,
    deleteMyCvProfile,
    addMyEducation,
    updateMyEducation,
    deleteMyEducation,
    addMyExperience,
    updateMyExperience,
    deleteMyExperience,
    fetchCvProfileWithUserDetails,
} from "../controllers/cvProfile.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(auth);
router.use(isRole("JOBSEEKER"));

// [POST] /api/cv-profiles: Tạo hoặc Cập nhật CV Profile (dựa vào user ID từ token)
// Controller createMyCvProfile giờ sẽ dùng createOrUpdateCvProfile service
router.post("/", upload.single("cvPdf"), createMyCvProfile);

// [GET] /api/cv-profiles: Lấy CV Profile duy nhất của người dùng hiện tại
router.get("/", getMyCvProfileDetail);
// <--- ADD THESE ROUTES FOR MAIN CV PROFILE UPDATE/DELETE
router.put("/:id", upload.single("cvPdf"), updateMyCvProfile); // Update main CV Profile fields and/or PDF
router.delete("/:id", deleteMyCvProfile); // Delete entire CV Profile
// **LOẠI BỎ DÒNG NÀY NẾU CHỈ CÓ 1 CV/USER:**
// router.get("/", getMyCvProfilesList);

// ... (các routes PUT và DELETE giữ nguyên)

router.post("/:id/education", addMyEducation); // Thêm Education mới vào CV có ID
router.put("/:id/education/:eduId", updateMyEducation); // Cập nhật Education cụ thể trong CV
router.delete("/:id/education/:eduId", deleteMyEducation); // Xóa Education cụ thể khỏi CV

router.post("/:id/experience", addMyExperience); // Thêm Experience mới vào CV có ID
router.put("/:id/experience/:expId", updateMyExperience); // Cập nhật Experience cụ thể trong CV
router.delete("/:id/experience/:expId", deleteMyExperience); // Xóa Experience cụ thể khỏi CV
router.get("/:cvProfileId/details", fetchCvProfileWithUserDetails);
export default router;
