import mongoose from "mongoose";
import CompanyProfile from "../models/companyprofile.model.js";
import LimitJobs from "../models/limitJobs.model.js";
import Job from "../models/jobs.model.js";
import Application from "../models/application.model.js";
import Payment from "../models/payment.model.js";
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

export const getApprovedCompanies = async () => {
    try {
        const approvedCompanies = await CompanyProfile.find({
            isApproved: true,
        }).populate("user", "email role");
        return dataResponse(
            200,
            "Successfully retrieved approved companies",
            approvedCompanies
        );
    } catch (err) {
        return dataResponse(500, err.message, null);
    }
};

export const getCompanyApprovalStats = async () => {
    try {
        // Lấy tất cả công ty và populate user để kiểm tra isBanned
        const companies = await CompanyProfile.find().populate('user', 'isBanned');
        let approved = 0, pending = 0, inActive = 0;
        companies.forEach(company => {
            const isBanned = company.user && company.user.isBanned === true;
            if (isBanned) {
                inActive++;
            } else if (company.isApproved) {
                approved++;
            } else {
                pending++;
            }
        });
        return dataResponse(200, "Company approval stats", {
            approved,
            pending,
            inActive,
            total: companies.length
        });
    } catch (err) {
        return dataResponse(500, err.message, null);
    }
};

export const filterCompanies = async (location, industry, companySize) => {
    try {
        let query = {};
        // Lọc theo location
        if (location) {
            let locations = Array.isArray(location) ? location : location.split(",").map(l => l.trim()).filter(Boolean);
            if (locations.length === 1) {
                query.location = { $regex: locations[0], $options: "i" };
            } else if (locations.length > 1) {
                query.$or = locations.map(loc => ({ location: { $regex: loc, $options: "i" } }));
            }
        }
        // Lọc theo industry
        if (industry) {
            let industries = Array.isArray(industry) ? industry : industry.split(",").map(i => i.trim()).filter(Boolean);
            if (industries.length === 1) {
                query.industry = { $regex: industries[0], $options: "i" };
            } else if (industries.length > 1) {
                if (!query.$or) query.$or = [];
                query.$or = query.$or.concat(industries.map(ind => ({ industry: { $regex: ind, $options: "i" } })));
            }
        }
        // Lọc theo companySize
        if (companySize) {
            let sizes = Array.isArray(companySize) ? companySize : companySize.split(",").map(s => s.trim()).filter(Boolean);
            if (sizes.length === 1) {
                query.companySize = sizes[0];
            } else if (sizes.length > 1) {
                query.companySize = { $in: sizes };
            }
        }
        const companies = await CompanyProfile.find(query).populate("user", "email role");
        // Lấy số lượng job cho từng company
        const companiesWithJobCount = await Promise.all(companies.map(async (company) => {
            const jobCount = await Job.countDocuments({ company: company._id });
            // Chỉ trả về các trường cần thiết của user
            let userObj = company.user;
            if (userObj && typeof userObj === 'object' && userObj._id) {
                let isBanned = userObj.isBanned;
                if (isBanned === undefined) {
                    const userDoc = await User.findById(userObj._id).select('isBanned');
                    if (userDoc) isBanned = userDoc.isBanned;
                }
                userObj = {
                    _id: userObj._id,
                    email: userObj.email,
                    role: userObj.role,
                    isBanned: isBanned
                };
            }
            return { ...company.toObject(), jobCount, user: userObj };
        }));
        return dataResponse(200, "Companies filtered by location/industry/size", companiesWithJobCount);
    } catch (err) {
        return dataResponse(500, err.message, null);
    }
};
