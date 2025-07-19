import mongoose from "mongoose";
import CompanyProfile from "../models/companyprofile.model.js";
import LimitJobs from "../models/limitJobs.model.js";
import Job from "../models/jobs.model.js";
import Application from "../models/application.model.js";
import Payment from "../models/payment.model.js";

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
        await LimitJobs.create({ company: result._id });
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

export const getPendingCompanies = async () => {
    try {
        const pendingCompanies = await CompanyProfile.find({
            isApproved: false,
        }).populate("user", "email role");
        return dataResponse(
            200,
            "Successfully retrieved pending companies",
            pendingCompanies
        );
    } catch (err) {
        return dataResponse(500, err.message, null);
    }
};

export const updateCompanyApproval = async (companyId, isApproved) => {
    try {
        const updatedCompany = await CompanyProfile.findByIdAndUpdate(
            companyId,
            { isApproved: isApproved },
            { new: true }
        );
        if (!updatedCompany) {
            return dataResponse(404, "Company not found", null);
        }
        return dataResponse(
            200,
            "Company approval status updated",
            updatedCompany
        );
    } catch (err) {
        return dataResponse(500, err.message, null);
    }
};

export const getJobStats = async (userId) => {
    const companyId = await CompanyProfile.exists({ user: userId });
    if (!companyId) {
        return dataResponse(404, "not found this company", null);
    }
    const totalJob = await Job.find({ company: companyId });
    const jobIds = totalJob.map((job) => job._id);
    const totalApp = await Application.find({
        job: { $in: jobIds },
    }).countDocuments();
    const totalAppAccept = await Application.find({
        job: { $in: jobIds },
        status: "HIRED",
    }).countDocuments();
    const totalAppApplied = await Application.find({
        job: { $in: jobIds },
        status: "APPLIED",
    }).countDocuments();
    return dataResponse(200, "success", {
        totalJob: jobIds.length,
        totalApp: totalApp,
        totalAppAccept: totalAppAccept,
        totalAppApplied: totalAppApplied,
    });
};

export const getAllInVoices = async (userId) => {
    const invoiceList = await Payment.find({ userId: userId }).populate({
        path: "packageId",
        select: "name",
    });
    return dataResponse(200, "success", invoiceList);
};
