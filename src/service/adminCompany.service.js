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

// Get company approval statistics
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

// Get all companies with optional filters
export const getAllCompaniesForAdmin = async (filters = {}) => {
    try {
        let query = {};
        // Lọc theo location
        if (filters.location) {
            let locations = Array.isArray(filters.location) ? filters.location : filters.location.split(",").map(l => l.trim()).filter(Boolean);
            if (locations.length === 1) {
                query.location = { $regex: locations[0], $options: "i" };
            } else if (locations.length > 1) {
                query.$or = locations.map(loc => ({ location: { $regex: loc, $options: "i" } }));
            }
        }
        // Lọc theo industry
        if (filters.industry) {
            let industries = Array.isArray(filters.industry) ? filters.industry : filters.industry.split(",").map(i => i.trim()).filter(Boolean);
            if (industries.length === 1) {
                query.industry = { $regex: industries[0], $options: "i" };
            } else if (industries.length > 1) {
                if (!query.$or) query.$or = [];
                query.$or = query.$or.concat(industries.map(ind => ({ industry: { $regex: ind, $options: "i" } })));
            }
        }
        // Lọc theo companySize
        if (filters.companySize) {
            let sizes = Array.isArray(filters.companySize) ? filters.companySize : filters.companySize.split(",").map(s => s.trim()).filter(Boolean);
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

// Update company approval status
export const updateCompanyApprovalStatus = async (companyId, isApproved, reason = "") => {
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

// Delete company
export const deleteCompanyById = async (companyId) => {
    try {
        // Kiểm tra company có tồn tại không
        const company = await CompanyProfile.findById(companyId);
        if (!company) {
            return dataResponse(404, "Company not found", null);
        }

        // Xóa tất cả jobs của company
        await Job.deleteMany({ company: companyId });
        
        // Xóa tất cả applications liên quan đến jobs của company
        const jobIds = await Job.find({ company: companyId }).select('_id');
        if (jobIds.length > 0) {
            await Application.deleteMany({ job: { $in: jobIds } });
        }
        
        // Xóa limitJobs của company
        await LimitJobs.deleteOne({ company: companyId });
        
        // Xóa company profile
        const deletedCompany = await CompanyProfile.findByIdAndDelete(companyId);
        
        return dataResponse(200, "Company deleted successfully", deletedCompany);
    } catch (err) {
        console.error("Error deleting company:", err);
        return dataResponse(500, err.message, null);
    }
};

// Get company details for admin
export const getCompanyDetailsForAdmin = async (companyId) => {
    try {
        const company = await CompanyProfile.findById(companyId)
            .populate("user", "firstName lastName email role isBanned banReason banAt");
        
        if (!company) {
            return dataResponse(404, "Company not found", null);
        }
        
        // Get job statistics
        const jobs = await Job.find({ company: companyId });
        const jobIds = jobs.map(job => job._id);
        
        const totalApplications = await Application.countDocuments({
            job: { $in: jobIds }
        });
        
        const hiredApplications = await Application.countDocuments({
            job: { $in: jobIds },
            status: "HIRED"
        });
        
        const rejectedApplications = await Application.countDocuments({
            job: { $in: jobIds },
            status: "REJECTED"
        });
        
        const pendingApplications = await Application.countDocuments({
            job: { $in: jobIds },
            status: "APPLIED"
        });
        
        const totalViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0);
        
        const stats = {
            totalJobs: jobs.length,
            activeJobs: jobs.filter(job => !job.isExpired).length,
            expiredJobs: jobs.filter(job => job.isExpired).length,
            totalApplications,
            hiredApplications,
            rejectedApplications,
            pendingApplications,
            totalViews
        };
        
        const recentJobs = jobs
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(job => ({
                _id: job._id,
                title: job.title,
                applicants: job.applicants || 0,
                views: job.views || 0,
                status: job.isExpired ? "EXPIRED" : "ACTIVE",
                createdAt: job.createdAt
            }));
        
        return dataResponse(200, "Company details retrieved successfully", {
            company,
            stats,
            recentJobs
        });
    } catch (err) {
        return dataResponse(500, err.message, null);
    }
};

// Get pending companies for approval
export const getPendingCompaniesForAdmin = async () => {
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