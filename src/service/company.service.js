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
        const userObjectId = new mongoose.Types.ObjectId(userId);
        // Lấy profile hiện tại
        const currentProfile = await CompanyProfile.findOne({
            user: userObjectId,
        });
        if (!currentProfile) {
            return dataResponse(404, "Cannot find this company", null);
        }

        // 1. Xử lý xóa ảnh
        let albumImage = currentProfile.albumImage;
        if (Array.isArray(data.removeImages) && data.removeImages.length > 0) {
            albumImage = albumImage.filter(
                (img) => !data.removeImages.includes(img)
            );
        }

        // 2. Thêm ảnh mới (nếu có)
        if (Array.isArray(data.albumImage) && data.albumImage.length > 0) {
            albumImage = [...albumImage, ...data.albumImage];
        }

        // 3. Chuẩn bị dữ liệu update
        const { removeImages, albumImage: _ignore, ...restData } = data;
        const updateData = {
            ...restData,
            albumImage,
        };

        // 4. Update
        const updatedCompanyProfile = await CompanyProfile.findOneAndUpdate(
            { user: userObjectId },
            { $set: updateData },
            { new: true, runValidators: true }
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

export const companyApprove = async (userId) => {
    const isApproved = await CompanyProfile.findOne({
        user: userId,
    }).select("isApproved");
    console.log(isApproved);
    return dataResponse(200, "found", isApproved);
};
