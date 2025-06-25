import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { hashPassword } from "../utils/auth.util.js";

const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

export const getUser = async (userId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
        return dataResponse(404, "can not find this User", null);
    }
    return dataResponse(200, "success", user);
};

export const updateUser = async (userId, userProfile) => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
        return dataResponse(404, "can not find this User", null);
    }
    const updatedUser = await User.findByIdAndUpdate(userId, userProfile);
    return dataResponse(200, "updated", updatedUser);
};

export const changePassword = async (userId, currentPassword, newPassword) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return dataResponse(404, "User not found", null);
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return dataResponse(401, "Current password is incorrect", null);
        }

        // Hash and update new password
        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();

        return dataResponse(200, "Password changed successfully", null);
    } catch (err) {
        return dataResponse(500, `Server error: ${err.message}`, null);
    }
};
