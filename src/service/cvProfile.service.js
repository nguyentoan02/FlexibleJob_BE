// src/service/cvProfile.service.js
import User from "../models/user.model.js";
import CvProfile from "../models/cvProfile.model.js";
import { uploadPdfToCloudinary } from "../utils/cloudinary.util.js";

const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

/**
 * Tạo hoặc cập nhật CV Profile cho người dùng.
 * Nếu người dùng đã có CV Profile, nó sẽ được cập nhật. Nếu chưa, một CV Profile mới sẽ được tạo.
 * @param {string} userId - ID của người dùng (lấy từ token).
 * @param {Object} cvProfileData - Dữ liệu CV Profile.
 * @param {Object} pdfFile - Đối tượng file PDF từ Multer (req.file), có thể là null nếu không có file mới.
 * @returns {Promise<Object>} - Đối tượng dataResponse.
 */
export const createOrUpdateCvProfile = async (
    userId,
    cvProfileData,
    pdfFile
) => {
    // **ĐỔI TÊN HÀM NÀY**
    try {
        const user = await User.findById(userId);
        if (!user) {
            return dataResponse(404, "User not found.", null);
        }

        let pdfUrl = null;
        if (pdfFile) {
            if (pdfFile.mimetype !== "application/pdf") {
                return dataResponse(400, "File must be a PDF document.", null);
            }
            const uploadResult = await uploadPdfToCloudinary(
                pdfFile.buffer,
                pdfFile.originalname
            );
            if (!uploadResult || !uploadResult.secure_url) {
                return dataResponse(500, "Failed to upload PDF file.", null);
            }
            pdfUrl = uploadResult.secure_url;
        }

        // Tìm CV Profile hiện có của người dùng
        let cvProfile = await CvProfile.findOne({ user: userId });

        if (cvProfile) {
            // Nếu đã có CV Profile, cập nhật nó
            Object.assign(cvProfile, cvProfileData);
            if (pdfUrl) {
                cvProfile.linkUrl = pdfUrl;
            }
            await cvProfile.save();
            return dataResponse(
                200,
                "CV Profile updated successfully.",
                cvProfile
            );
        } else {
            // Nếu chưa có CV Profile, tạo mới
            const newCvProfile = new CvProfile({
                ...cvProfileData,
                user: userId,
                linkUrl: pdfUrl,
            });
            await newCvProfile.save();

            // **ĐIỂM CỰC KỲ QUAN TRỌNG: GÁN TRỰC TIẾP ID VÀO cvProfile của user**
            user.cvProfile = newCvProfile._id; // <-- SỬA TẠI ĐÂY!
            await user.save();

            return dataResponse(
                201,
                "CV Profile created successfully.",
                newCvProfile
            );
        }
    } catch (error) {
        console.error("Error in createOrUpdateCvProfile service:", error); // Log với tên hàm mới
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

/**
 * Lấy danh sách tất cả CV Profile của một người dùng.
 * **Lưu ý: Nếu mỗi user chỉ có 1 CV, hàm này có thể không cần thiết.**
 * Nếu bạn muốn giữ, đảm bảo User.cvProfile là kiểu mảng.
 */
export const getAllCvProfilesByUser = async (userId) => {
    try {
        // Nếu user.cvProfile là một ObjectId duy nhất, hàm này sẽ trả về một mảng chứa 0 hoặc 1 CV.
        // Có thể cân nhắc loại bỏ hàm này nếu chỉ có một CV.
        const cvProfiles = await CvProfile.find({ user: userId })
            .populate("user", "email firstName lastName imageUrl")
            .lean();
        return dataResponse(
            200,
            "CV Profiles fetched successfully.",
            cvProfiles
        );
    } catch (error) {
        console.error("Error in getAllCvProfilesByUser service:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

/**
 * Lấy CV Profile của người dùng hiện tại (dựa vào userId từ token).
 * @param {string} userId - ID của người dùng.
 * @returns {Promise<Object>} - Đối tượng dataResponse chứa thông tin CV Profile hoặc thông báo lỗi.
 */
export const getMyCvProfile = async (userId) => {
    try {
        // Tìm kiếm CV Profile dựa trên user ID
        const cvProfile = await CvProfile.findOne({ user: userId })
            .populate("user", "email firstName lastName number imageUrl")
            .lean();

        if (!cvProfile) {
            return dataResponse(
                404,
                "CV Profile not found for this user.",
                null
            );
        }

        return dataResponse(200, "CV Profile fetched successfully.", cvProfile);
    } catch (error) {
        console.error("Error in getMyCvProfile service:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

/**
 * Cập nhật một CV Profile cụ thể.
 * @param {string} cvProfileId - ID của CV Profile cần cập nhật.
 * @param {string} userId - ID của người dùng (để xác minh quyền sở hữu).
 * @param {Object} updateData - Dữ liệu cập nhật.
 * @param {Object} pdfFile - Đối tượng file PDF từ Multer (req.file) nếu có.
 * @returns {Promise<Object>} - Đối tượng dataResponse chứa thông tin CV đã cập nhật.
 */
export const updateCvProfile = async (
    cvProfileId,
    userId,
    updateData,
    pdfFile
) => {
    try {
        const cvProfile = await CvProfile.findById(cvProfileId);

        if (!cvProfile) {
            return dataResponse(404, "CV Profile not found for update.", null);
        }

        // Đảm bảo người dùng sở hữu CV này
        if (cvProfile.user.toString() !== userId) {
            return dataResponse(
                403,
                "Access denied. You do not own this CV Profile.",
                null
            );
        }

        // Nếu có file PDF mới được gửi lên, upload và cập nhật linkUrl
        if (pdfFile) {
            // Thêm validation cho file PDF ở đây, tương tự createOrUpdateCvProfile
            if (pdfFile.mimetype !== "application/pdf") {
                return dataResponse(400, "File must be a PDF document.", null);
            }
            const uploadResult = await uploadPdfToCloudinary(
                pdfFile.buffer,
                pdfFile.originalname
            );
            if (!uploadResult || !uploadResult.secure_url) {
                return dataResponse(500, "Failed to upload PDF file.", null);
            }
            updateData.linkUrl = uploadResult.secure_url;
        }

        const updatedCv = await CvProfile.findByIdAndUpdate(
            cvProfileId,
            updateData,
            { new: true }
        ).lean();
        return dataResponse(200, "CV Profile updated successfully.", updatedCv);
    } catch (error) {
        console.error("Error in updateCvProfile service:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

/**
 * Xóa một CV Profile cụ thể.
 * @param {string} cvProfileId - ID của CV Profile cần xóa.
 * @param {string} userId - ID của người dùng (để xác minh quyền sở hữu).
 * @returns {Promise<Object>} - Đối tượng dataResponse.
 */
export const deleteCvProfile = async (cvProfileId, userId) => {
    try {
        const cvProfile = await CvProfile.findById(cvProfileId);

        if (!cvProfile) {
            return dataResponse(
                404,
                "CV Profile not found for deletion.",
                null
            );
        }

        // Đảm bảo người dùng sở hữu CV này
        if (cvProfile.user.toString() !== userId) {
            return dataResponse(
                403,
                "Access denied. You do not own this CV Profile.",
                null
            );
        }

        await CvProfile.findByIdAndDelete(cvProfileId);

        const user = await User.findById(userId);
        if (user) {
            // **ĐIỂM CẦN SỬA: Đặt lại cvProfile của user thành null khi xóa**
            // user.cvProfile = user.cvProfile.filter(...) // Dòng này nếu user.cvProfile là mảng
            user.cvProfile = null; // <-- SỬA TẠI ĐÂY!
            await user.save();
        }

        return dataResponse(200, "CV Profile deleted successfully.", null);
    } catch (error) {
        console.error("Error in deleteCvProfile service:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};
/**
 * Thêm một mục giáo dục mới vào CV Profile.
 * @param {string} cvProfileId - ID của CV Profile.
 * @param {string} userId - ID của người dùng (để xác minh quyền sở hữu).
 * @param {Object} educationData - Dữ liệu mục giáo dục mới.
 * @returns {Promise<Object>} - Đối tượng dataResponse chứa CV đã cập nhật.
 */
export const addEducationToCv = async (cvProfileId, userId, educationData) => {
    try {
        const cvProfile = await CvProfile.findById(cvProfileId);
        if (!cvProfile) {
            return dataResponse(404, "CV Profile not found.", null);
        }
        if (cvProfile.user.toString() !== userId) {
            return dataResponse(
                403,
                "Access denied. You do not own this CV Profile.",
                null
            );
        }

        // Đảm bảo educationData là một đối tượng và không rỗng
        if (!educationData || Object.keys(educationData).length === 0) {
            return dataResponse(
                400,
                "Education data is empty or invalid.",
                null
            );
        }

        cvProfile.education.push(educationData); // Thêm vào mảng education
        await cvProfile.save();

        // Sau khi save, populate lại để đảm bảo dữ liệu đầy đủ nếu cần
        const updatedCvProfile = await CvProfile.findById(cvProfileId).lean(); // Lấy lại bản cập nhật mới nhất

        return dataResponse(
            200,
            "Education added successfully.",
            updatedCvProfile
        );
    } catch (error) {
        console.error("Error in addEducationToCv service:", error);
        // Kiểm tra lỗi validation từ Mongoose
        if (error.name === "ValidationError") {
            return dataResponse(
                400,
                `Validation Error: ${error.message}`,
                null
            );
        }
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

/**
 * Cập nhật một mục giáo dục hiện có trong CV Profile.
 * @param {string} cvProfileId - ID của CV Profile.
 * @param {string} educationId - ID của mục giáo dục cần cập nhật.
 * @param {string} userId - ID của người dùng.
 * @param {Object} updateData - Dữ liệu cập nhật cho mục giáo dục.
 * @returns {Promise<Object>} - Đối tượng dataResponse chứa CV đã cập nhật.
 */
export const updateEducationInCv = async (
    cvProfileId,
    educationId,
    userId,
    updateData
) => {
    try {
        const cvProfile = await CvProfile.findById(cvProfileId);
        if (!cvProfile) {
            return dataResponse(404, "CV Profile not found.", null);
        }
        if (cvProfile.user.toString() !== userId) {
            return dataResponse(
                403,
                "Access denied. You do not own this CV Profile.",
                null
            );
        }

        const educationItem = cvProfile.education.id(educationId); // Tìm mục giáo dục theo ID
        if (!educationItem) {
            return dataResponse(404, "Education item not found.", null);
        }

        Object.assign(educationItem, updateData); // Cập nhật dữ liệu
        await cvProfile.save();
        return dataResponse(200, "Education updated successfully.", cvProfile);
    } catch (error) {
        console.error("Error in updateEducationInCv service:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

/**
 * Xóa một mục giáo dục khỏi CV Profile.
 * @param {string} cvProfileId - ID của CV Profile.
 * @param {string} educationId - ID của mục giáo dục cần xóa.
 * @param {string} userId - ID của người dùng.
 * @returns {Promise<Object>} - Đối tượng dataResponse chứa CV đã cập nhật.
 */
export const removeEducationFromCv = async (
    cvProfileId,
    educationId,
    userId
) => {
    try {
        const cvProfile = await CvProfile.findById(cvProfileId);
        if (!cvProfile) {
            return dataResponse(404, "CV Profile not found.", null);
        }
        if (cvProfile.user.toString() !== userId) {
            return dataResponse(
                403,
                "Access denied. You do not own this CV Profile.",
                null
            );
        }

        const educationItem = cvProfile.education.id(educationId); // Tìm mục giáo dục theo ID
        if (!educationItem) {
            return dataResponse(404, "Education item not found.", null);
        }

        // --- SỬA Ở ĐÂY: Dùng deleteOne() thay vì remove() ---
        educationItem.deleteOne(); // Xóa subdocument khỏi mảng
        // Hoặc: educationItem.remove(); // Nếu bạn đang dùng Mongoose <= 5.x

        await cvProfile.save(); // Lưu thay đổi vào database

        // Lấy lại CV profile sau khi xóa để trả về payload mới nhất
        const updatedCvProfile = await CvProfile.findById(cvProfileId).lean();

        return dataResponse(
            200,
            "Education removed successfully.",
            updatedCvProfile
        );
    } catch (error) {
        console.error("Error in removeEducationFromCv service:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

/**
 * Thêm một mục kinh nghiệm mới vào CV Profile.
 * @param {string} cvProfileId - ID của CV Profile.
 * @param {string} userId - ID của người dùng.
 * @param {Object} experienceData - Dữ liệu mục kinh nghiệm mới.
 * @returns {Promise<Object>} - Đối tượng dataResponse chứa CV đã cập nhật.
 */
export const addExperienceToCv = async (
    cvProfileId,
    userId,
    experienceData
) => {
    try {
        const cvProfile = await CvProfile.findById(cvProfileId);
        if (!cvProfile) {
            return dataResponse(404, "CV Profile not found.", null);
        }
        if (cvProfile.user.toString() !== userId) {
            return dataResponse(
                403,
                "Access denied. You do not own this CV Profile.",
                null
            );
        }

        cvProfile.experience.push(experienceData); // Thêm vào mảng experience
        await cvProfile.save();
        return dataResponse(200, "Experience added successfully.", cvProfile);
    } catch (error) {
        console.error("Error in addExperienceToCv service:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

/**
 * Cập nhật một mục kinh nghiệm hiện có trong CV Profile.
 * @param {string} cvProfileId - ID của CV Profile.
 * @param {string} experienceId - ID của mục kinh nghiệm cần cập nhật.
 * @param {string} userId - ID của người dùng.
 * @param {Object} updateData - Dữ liệu cập nhật cho mục kinh nghiệm.
 * @returns {Promise<Object>} - Đối tượng dataResponse chứa CV đã cập nhật.
 */
export const updateExperienceInCv = async (
    cvProfileId,
    experienceId,
    userId,
    updateData
) => {
    try {
        const cvProfile = await CvProfile.findById(cvProfileId);
        if (!cvProfile) {
            return dataResponse(404, "CV Profile not found.", null);
        }
        if (cvProfile.user.toString() !== userId) {
            return dataResponse(
                403,
                "Access denied. You do not own this CV Profile.",
                null
            );
        }

        const experienceItem = cvProfile.experience.id(experienceId); // Tìm mục kinh nghiệm theo ID
        if (!experienceItem) {
            return dataResponse(404, "Experience item not found.", null);
        }

        Object.assign(experienceItem, updateData); // Cập nhật dữ liệu
        await cvProfile.save();
        return dataResponse(200, "Experience updated successfully.", cvProfile);
    } catch (error) {
        console.error("Error in updateExperienceInCv service:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

/**
 * Xóa một mục kinh nghiệm khỏi CV Profile.
 * @param {string} cvProfileId - ID của CV Profile.
 * @param {string} experienceId - ID của mục kinh nghiệm cần xóa.
 * @param {string} userId - ID của người dùng.
 * @returns {Promise<Object>} - Đối tượng dataResponse chứa CV đã cập nhật.
 */
export const removeExperienceFromCv = async (
    cvProfileId,
    experienceId,
    userId
) => {
    try {
        const cvProfile = await CvProfile.findById(cvProfileId);
        if (!cvProfile) {
            return dataResponse(404, "CV Profile not found.", null);
        }
        if (cvProfile.user.toString() !== userId) {
            return dataResponse(
                403,
                "Access denied. You do not own this CV Profile.",
                null
            );
        }

        cvProfile.experience.id(experienceId).deleteOne(); // Xóa mục kinh nghiệm theo ID
        await cvProfile.save();
        return dataResponse(200, "Experience removed successfully.", cvProfile);
    } catch (error) {
        console.error("Error in removeExperienceFromCv service:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

/**Add commentMore actions
 * Lấy thông tin CV Profile cùng với các trường từ User.
 * @param {string} cvProfileId - ID của CV Profile.
 * @returns {Promise<Object>} - Đối tượng dataResponse chứa thông tin CV Profile và User.
 */
export const getCvProfileWithUserDetails = async (cvProfileId) => {
    try {
        // Tìm CV Profile và populate thông tin từ User
        const cvProfile = await CvProfile.findById(cvProfileId).populate({
            path: "user",
            select: "firstName lastName email imageUrl", // Chỉ lấy các trường cần thiết từ User
        });

        if (!cvProfile) {
            return dataResponse(404, "CV Profile not found.", null);
        }

        return dataResponse(200, "CV Profile fetched successfully.", cvProfile);
    } catch (error) {
        console.error("Error in getCvProfileWithUserDetails service:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};
