import mongoose from "mongoose";
import {
    companyApprove,
    createCompany,
    getAllInVoices,
    getCompanyByUserId,
    getCompanyProfile,
    getJobStats,
    updateCompanyProfile,
    getPendingCompanies,
    updateCompanyApproval,
    getApprovedCompanies,
    getCompanyApprovalStats,
    filterCompanies,
    deleteCompany
} from "../service/company.service.js";
import { uploadToCloudinary } from "../utils/cloudinary.util.js";
import { removeEmptyFields } from "../utils/handleArray.util.js";
import Job from "../models/jobs.model.js";
import Application from "../models/application.model.js";
import CompanyProfile from "../models/companyprofile.model.js";
import { sendEmail } from "../utils/auth.util.js";

export const getCompanyById = async (req, res) => {
    const { companyId } = req.params;
    const result = await getCompanyProfile(companyId);
    if (result.code !== 200) {
        return res.status(result.code).json({
            message: result.message,
            payload: result.payload,
        });
    }
    // Lấy thêm danh sách jobs của công ty
    const jobs = await Job.find({ company: companyId });
    // Populate thông tin user đầy đủ bao gồm trạng thái ban
    const companyWithUser = await CompanyProfile.findById(companyId)
        .populate("user", "firstName lastName email imageUrl role isBanned banReason banAt")
        .lean();
    return res.status(200).json({
        message: result.message,
        payload: {
            company: companyWithUser,
            jobs
        }
    });
};

export const updateCompany = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = {
            imageUrl: null,
            coverImage: null,
            albumImage: [],
            identityImage: [],
        };

        // Ensure removeImages is always an array
        const imagesToRemove = req.body.removeImages;

        // Xử lý upload ảnh mới
        if (req.files.imageUrl) {
            const file = req.files.imageUrl[0];
            const uploaded = await uploadToCloudinary(
                file.buffer,
                "Company_avatars"
            );
            result.imageUrl = uploaded.secure_url;
        }

        if (req.files.coverImage) {
            const file = req.files.coverImage[0];
            const uploaded = await uploadToCloudinary(
                file.buffer,
                "Company_covers"
            );
            result.coverImage = uploaded.secure_url;
        }

        if (req.files.albumImage) {
            for (const file of req.files.albumImage) {
                const uploaded = await uploadToCloudinary(
                    file.buffer,
                    "Company_albums"
                );
                result.albumImage.push(uploaded.secure_url);
            }
        }

        if (req.files.identityImage) {
            for (const file of req.files.identityImage) {
                const uploaded = await uploadToCloudinary(
                    file.buffer,
                    "Company_identityImage"
                );
                result.identityImage.push(uploaded.secure_url);
            }
        }

        const cleanedImages = removeEmptyFields(result);
        const profileData = {
            ...req.body,
            ...cleanedImages,
            removeImages: imagesToRemove,
        };

        console.log("profile data:", profileData);

        delete profileData._id;
        delete profileData.user;

        const update = await updateCompanyProfile(userId, profileData);
        res.status(update.code).json({
            message: update.message,
            payload: update.payload,
        });
    } catch (error) {
        console.error("Update Company Error:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const createCompanyProfile = async (req, res) => {
    const result = {
        imageUrl: null,
        coverImage: null,
        albumImage: [],
        identityImage: [],
    };

    if (req.files.imageUrl) {
        const file = req.files.imageUrl[0];
        const uploaded = await uploadToCloudinary(
            file.buffer,
            "Company_avatars"
        );
        result.imageUrl = uploaded.secure_url;
    }

    if (req.files.coverImage) {
        const file = req.files.coverImage[0];
        const uploaded = await uploadToCloudinary(
            file.buffer,
            "Company_covers"
        );
        result.coverImage = uploaded.secure_url;
    }

    if (req.files.albumImage) {
        for (const file of req.files.albumImage) {
            const uploaded = await uploadToCloudinary(
                file.buffer,
                "Company_albums"
            );
            result.albumImage.push(uploaded.secure_url);
        }
    }

    if (req.files.identityImage) {
        for (const file of req.files.identityImage) {
            const uploaded = await uploadToCloudinary(
                file.buffer,
                "Company_identityImage"
            );
            result.identityImage.push(uploaded.secure_url);
        }
    }

    const data = {
        ...result,
        ...req.body,
        user: req.user.id,
    };

    const company = await createCompany(data);
    res.status(company.code).json({
        message: company.message,
        payload: company.payload,
    });
};

export const getMyCompany = async (req, res) => {
    const userId = req.user.id;
    const result = await getCompanyByUserId(userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const getPendingCompaniesForAdmin = async (req, res) => {
    const result = await getPendingCompanies();
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const approveCompanyById = async (req, res) => {
    const { companyId } = req.params;
    const { isApproved } = req.body;
    const result = await updateCompanyApproval(companyId, isApproved);
    
    // Nếu reject company (isApproved = false), gửi email thông báo
    if (!isApproved && result.code === 200) {
        try {
            // Lấy thông tin company và user
            const company = await CompanyProfile.findById(companyId).populate("user", "email firstName lastName");
            if (company && company.user) {
                const emailSubject = "Thông báo về hồ sơ công ty";
                const emailContent = `
                    Xin chào ${company.user.firstName} ${company.user.lastName},
                    
                    Chúng tôi rất tiếc phải thông báo rằng hồ sơ công ty "${company.companyName}" của bạn đã không được duyệt.
                    
                    Lý do có thể bao gồm:
                    - Thông tin công ty chưa đầy đủ hoặc không chính xác
                    - Tài liệu xác thực chưa đáp ứng yêu cầu
                    - Vi phạm các quy định của hệ thống
                    
                    Vui lòng kiểm tra và cập nhật lại thông tin công ty để được xem xét lại.
                    
                    Trân trọng,
                    Đội ngũ quản trị hệ thống
                `;
                
                await sendEmail(company.user.email, emailSubject, emailContent);
            }
        } catch (emailError) {
            console.error("Error sending rejection email:", emailError);
            // Không trả về lỗi nếu gửi email thất bại, vẫn trả về kết quả approve
        }
    }
    
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const isCompanyApproved = async (req, res) => {
    const userId = req.user.id;
    console.log(userId);
    const result = await companyApprove(userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const statsJob = async (req, res) => {
    const userId = req.user.id;
    const result = await getJobStats(userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const statsInVoice = async (req, res) => {
    const userId = req.user.id;
    const result = await getAllInVoices(userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const getApprovedCompaniesForAdmin = async (req, res) => {
    const result = await getApprovedCompanies();
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const getCompanyApprovalStatsController = async (req, res) => {
    const result = await getCompanyApprovalStats();
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const filterCompaniesController = async (req, res) => {
    const { location, industry, companySize } = req.query;
    const result = await filterCompanies(location, industry, companySize);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const deleteCompanyById = async (req, res) => {
    const { companyId } = req.params;
    const result = await deleteCompany(companyId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};
