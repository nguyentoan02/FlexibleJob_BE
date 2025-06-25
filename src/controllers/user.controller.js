import User from "../models/user.model.js";
import { getUser, updateUser, changePassword as changePasswordService } from "../service/user.service.js";

// Helper function để tạo response chuẩn
const createResponse = (message, data, count = null) => ({
    message,
    data,
    ...(count !== null && { count })
});

// Helper function để handle error
const handleError = (res, error, message = "Lỗi server") => {
    console.error(`User Controller Error: ${message}`, error);
    res.status(500).json({
        message,
        error: error.message
    });
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(createResponse("Lấy danh sách tất cả users thành công", users, users.length));
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy danh sách users");
    }
};

export const getActiveUsers = async (req, res) => {
    try {
        const users = await User.find({ 
            isBanned: false,
            role: { $ne: "ADMIN" }
        }).select("-password");
        res.json(createResponse("Lấy danh sách users thành công", users, users.length));
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy danh sách users hoạt động");
    }
};

export const getBannedUsers = async (req, res) => {
    try {
        const users = await User.find({ isBanned: true }).select("-password");
        res.json(createResponse("Lấy danh sách users đã bị ban thành công", users, users.length));
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy danh sách users bị ban");
    }
};

export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await getUser(userId);
        res.status(result.code).json({
            message: result.message,
            payload: result.payload,
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy thông tin user");
    }
};

export const updateUserProfileById = async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, packageId } = req.body;

        const updateUserProfile = { firstName, lastName, packageId };
        const result = await updateUser(userId, updateUserProfile);
        
        res.status(result.code).json({
            message: result.message,
            payload: result.payload,
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi cập nhật profile user");
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const result = await changePasswordService(userId, currentPassword, newPassword);
        res.status(result.code).json({
            message: result.message,
            payload: result.payload,
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi đổi mật khẩu");
    }
};
