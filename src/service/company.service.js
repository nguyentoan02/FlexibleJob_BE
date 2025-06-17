import mongoose from "mongoose";
import CompanyProfile from "../models/companyprofile.model.js";

const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

export const getCompanyProfile = async (companyId) => {
    const companyProfile = await CompanyProfile.findById(companyId);
    if (!companyProfile) {
        return dataResponse(404, "can not find this company", null);
    }
    return dataResponse(200, "found", companyProfile);
};

export const updateCompanyProfile = async (userId, data) => {
    try {
        const updateOperations = {};

        // Ensure removeImages is an array and not empty before adding $pull
        if (Array.isArray(data.removeImages) && data.removeImages.length > 0) {
            updateOperations.$pull = {
                albumImage: { $in: data.removeImages },
            };
        }

        // Ensure albumImage is an array and not empty before adding $push
        if (Array.isArray(data.albumImage) && data.albumImage.length > 0) {
            updateOperations.$push = {
                albumImage: { $each: data.albumImage },
            };
        }

        // Remove removeImages from data before spreading into $set
        const { removeImages, ...restData } = data;

        updateOperations.$set = restData;

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const updatedCompanyProfile = await CompanyProfile.findOneAndUpdate(
            { user: userObjectId },
            updateOperations,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedCompanyProfile) {
            return dataResponse(404, "Cannot find this company", null);
        }

        return dataResponse(200, "Success", updatedCompanyProfile);
    } catch (err) {
        console.error("Service Error:", err);
        return dataResponse(500, err.message, null);
    }
};

export const createCompany = async (data) => {
    try {
        const result = await CompanyProfile.create(data);
        return dataResponse(200, "create success", result);
    } catch (err) {
        return dataResponse(500, err.message, null);
    }
};

export const getCompanyByUserId = async (userId) => {
    const company = await CompanyProfile.findOne({ user: userId }).populate(
        "user"
    );
    if (!company) {
        return dataResponse(404, "can not find this company profile", null);
    }
    return dataResponse(200, "found company profile", company);
};
