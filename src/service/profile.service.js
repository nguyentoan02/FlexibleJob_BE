import User from "../models/user.model.js"; // Import User model hiện có

const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

/**
 * Lấy thông tin profile của một người dùng cụ thể.
 * @param {string} userId - ID của người dùng.
 * @returns {Promise<Object>} - Đối tượng dataResponse chứa thông tin người dùng hoặc lỗi.
 */
export const getProfileById = async (userId) => {
    try {
        const user = await User.findById(userId).select("-password"); // Không trả về mật khẩu
        if (!user) {
            return dataResponse(404, "User profile not found", null);
        }
        return dataResponse(200, "User profile fetched successfully", user);
    } catch (error) {
        console.error("Error in getProfileById service:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

/**
 * Cập nhật thông tin profile của người dùng.
 * @param {string} userId - ID của người dùng cần cập nhật.
 * @param {Object} profileData - Dữ liệu profile mới (firstName, lastName, imageUrl).
 * @returns {Promise<Object>} - Đối tượng dataResponse chứa thông tin người dùng đã cập nhật hoặc lỗi.
 */
export const updateProfile = async (userId, profileData) => {
    try {
        // FindByIdAndUpdate sẽ trả về tài liệu trước khi cập nhật nếu không có { new: true }
        // Chúng ta muốn tài liệu sau khi cập nhật, và loại bỏ trường password
        const updatedUser = await User.findByIdAndUpdate(userId, profileData, {
            new: true,
        }).select("-password");

        if (!updatedUser) {
            return dataResponse(404, "User not found for update", null);
        }
        return dataResponse(
            200,
            "User profile updated successfully",
            updatedUser
        );
    } catch (error) {
        console.error("Error in updateProfile service:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};
