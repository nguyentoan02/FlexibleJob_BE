import mongoose from "mongoose";
import CompanyProfile from "../models/companyprofile.model.js";
import LimitJobs from "../models/limitJobs.model.js";
import Job from "../models/jobs.model.js";
import Application from "../models/application.model.js";
import Payment from "../models/payment.model.js";
import { sendEmail } from "../utils/auth.util.js";
import User from "../models/user.model.js";

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
            updateData,
            { new: true }
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

export const updateCompanyApproval = async (
    companyId,
    isApproved,
    reason = ""
) => {
    try {
        const updatedCompany = await CompanyProfile.findByIdAndUpdate(
            companyId,
            { isApproved: isApproved },
            { new: true }
        ).populate("user");
        if (!updatedCompany) {
            return dataResponse(404, "Company not found", null);
        }

        // Gửi email cho chủ công ty
        if (updatedCompany.user && updatedCompany.user.email) {
            if (isApproved) {
                await sendEmail(
                    updatedCompany.user.email,
                    "Công ty của bạn đã được duyệt",
                    `Chúc mừng! Công ty "${updatedCompany.companyName}" đã được duyệt và có thể sử dụng các tính năng của hệ thống.`
                );
            } else {
                await sendEmail(
                    updatedCompany.user.email,
                    "Công ty của bạn bị từ chối",
                    `Rất tiếc! Công ty "${
                        updatedCompany.companyName
                    }" đã bị từ chối duyệt. Lý do: ${
                        reason ||
                        "Không đáp ứng đủ điều kiện hoặc thông tin chưa hợp lệ."
                    }`
                );
            }
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
    const invoiceList = await Payment.find({ userId: userId })
        .populate({
            path: "packageId",
            select: "name",
        })
        .sort({ createdAt: -1 });
    return dataResponse(200, "success", invoiceList);
};

export const getAllCompaniesWithJobs = async () => {
    try {
        // Lấy tất cả công ty đã được duyệt
        const companies = await CompanyProfile.find({
            status: true,
            isApproved: true,
        }).lean();

        // Lấy job cho từng công ty
        const companyIds = companies.map((c) => c._id);
        const jobs = await Job.find({
            company: { $in: companyIds },
            isExpired: false,
            isHidden: { $ne: true },
        })
            .select(
                "company title description location salary level datePosted"
            )
            .lean();

        // Gom job theo companyId
        const jobsByCompany = {};
        jobs.forEach((job) => {
            const cid = job.company.toString();
            if (!jobsByCompany[cid]) jobsByCompany[cid] = [];
            jobsByCompany[cid].push(job);
        });

        // Gắn số lượng job và danh sách job vào từng công ty
        const result = companies.map((company) => ({
            ...company,
            jobCount: jobsByCompany[company._id.toString()]?.length || 0,
            jobs: jobsByCompany[company._id.toString()] || [],
        }));

        return dataResponse(200, "Company list with jobs", result);
    } catch (err) {
        return dataResponse(500, err.message, null);
    }
};

export const getTimeSeriesStats = async (userId, metric, range) => {
    try {
        const company = await CompanyProfile.findOne({ user: userId });
        if (!company) {
            return dataResponse(404, "Company not found", null);
        }
        const companyId = company._id;

        let Model;
        let dateField = "createdAt";
        let matchQuery = {};

        // 1. Determine Model and query based on metric
        if (metric === "followers") {
            const module = await import("../models/followcompany.model.js");
            Model = module.default;
            matchQuery = { company: companyId };
        } else if (metric === "applications") {
            const module = await import("../models/application.model.js");
            Model = module.default;
            const companyJobs = await Job.find({ company: companyId }).select(
                "_id"
            );
            const jobIds = companyJobs.map((job) => job._id);
            matchQuery = { job: { $in: jobIds } };
        } else {
            return dataResponse(400, "Invalid metric type", null);
        }

        // 2. Determine time range
        const endDate = new Date();
        const startDate = new Date();
        if (range === "30d") {
            startDate.setDate(endDate.getDate() - 30);
        } else if (range === "90d") {
            startDate.setDate(endDate.getDate() - 90);
        } else if (range === "1y") {
            startDate.setFullYear(endDate.getFullYear() - 1);
        } else {
            return dataResponse(400, "Invalid range", null);
        }

        matchQuery[dateField] = { $gte: startDate, $lte: endDate };

        // 3. Use Aggregation Framework to group and count
        const stats = await Model.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: `$${dateField}`,
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", count: 1 } },
        ]);

        // 4. Fill in days with no data
        const statsMap = new Map(stats.map((item) => [item.date, item.count]));
        const result = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split("T")[0];
            result.push({
                date: dateString,
                count: statsMap.get(dateString) || 0,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dataResponse(
            200,
            "Successfully retrieved time series stats",
            result
        );
    } catch (err) {
        console.error("Service Error:", err);
        return dataResponse(500, err.message, null);
    }
};

export const getCompanyDetailWithJobs = async (companyId) => {
    try {
        const company = await CompanyProfile.findById(companyId).lean();
        if (!company) {
            return dataResponse(404, "Company not found", null);
        }
        const jobs = await Job.find({
            company: companyId,
            isExpired: false,
            isHidden: { $ne: true },
        })
            .select("title description location salary level datePosted")
            .lean();
        return dataResponse(200, "Company detail with jobs", {
            ...company,
            jobs,
            jobCount: jobs.length,
        });
    } catch (err) {
        return dataResponse(500, err.message, null);
    }
};
