import User from "../models/user.model.js";

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
