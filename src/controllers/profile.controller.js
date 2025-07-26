import { getProfileById, updateProfile } from "../service/profile.service.js";
import { uploadImageToCloudinary } from "../utils/cloudinary.util.js";

const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

/**
 * Lấy thông tin profile của người dùng đã đăng nhập.
 * Yêu cầu: Người dùng đã xác thực (auth và profileAuth middleware).
 */
export const getMyProfile = async (req, res) => {
    // Đổi tên hàm cho rõ ràng hơn
    try {
        const userId = req.user.id; // NEW: Lấy ID người dùng từ token đã giải mã

        const result = await getProfileById(userId);
        return res.status(result.code).json(result);
    } catch (error) {
        console.error("Error in getMyProfile controller:", error);
        return res
            .status(500)
            .json(
                dataResponse(500, "Server error during profile retrieval", null)
            );
    }
};

/**
 * Cập nhật thông tin profile của người dùng đã đăng nhập.
 * Yêu cầu: Người dùng đã xác thực (auth và profileAuth middleware).
 * Hỗ trợ cập nhật firstName, lastName và imageUrl (tải ảnh lên Cloudinary).
 */
export const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.id; // NEW: Lấy ID người dùng từ token đã giải mã
        const { firstName, lastName } = req.body;
        let imageUrl = req.body.imageUrl;

        if (req.file) {
            const uploadResult = await uploadImageToCloudinary(
                req.file.buffer,
                req.file.originalname
            );
            if (uploadResult && uploadResult.secure_url) {
                imageUrl = uploadResult.secure_url;
            } else {
                return res
                    .status(500)
                    .json(
                        dataResponse(
                            500,
                            "Failed to upload profile image",
                            null
                        )
                    );
            }
        }

        const profileDataToUpdate = {
            firstName,
            lastName,
            imageUrl,
            updatedAt: Date.now(),
        };

        const result = await updateProfile(userId, profileDataToUpdate);
        return res.status(result.code).json(result);
    } catch (error) {
        console.error("Error in updateMyProfile controller:", error);
        return res
            .status(500)
            .json(
                dataResponse(500, "Server error during profile update", null)
            );
    }
};
