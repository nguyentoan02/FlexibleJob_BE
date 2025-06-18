import User from "../models/user.model.js";
import { getUser, updateUser, changePassword as changePasswordService } from "../service/user.service.js";

export const getAllUsers = async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
};

export const getUserById = async (req, res) => {
    const { userId } = req.params;
    const result = await getUser(userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const updateUserProfileById = async (req, res) => {
    const { userId } = req.params;
    const { firstName, lastName, packageId } = req.body;

    const updateUserProfile = {
        firstName: firstName,
        lastName: lastName,
        packageId: packageId,
    };

    const result = await updateUser(userId, updateUserProfile);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // This comes from the auth middleware

    const result = await changePasswordService(userId, currentPassword, newPassword);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};
