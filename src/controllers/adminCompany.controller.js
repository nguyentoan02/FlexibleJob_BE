import {
    getCompanyApprovalStats,
    getAllCompaniesForAdmin,
    updateCompanyApprovalStatus,
    deleteCompanyById,
    getCompanyDetailsForAdmin,
    getPendingCompaniesForAdmin,
} from "../service/adminCompany.service.js";
import { sendEmail } from "../utils/auth.util.js";
import CompanyProfile from "../models/companyprofile.model.js";

// Get company approval statistics
export const getCompanyApprovalStatsController = async (req, res) => {
    const result = await getCompanyApprovalStats();
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

// Get all companies with optional filters
export const getCompanyListController = async (req, res) => {
    const filters = req.query;
    const result = await getAllCompaniesForAdmin(filters);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

// Update company approval status
export const updateCompanyApprovalController = async (req, res) => {
    const { companyId } = req.params;
    const { isApproved, reason } = req.body;
    
    const result = await updateCompanyApprovalStatus(companyId, isApproved, reason);
    
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

// Delete company
export const deleteCompanyController = async (req, res) => {
    const { companyId } = req.params;
    const result = await deleteCompanyById(companyId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

// Get company details for admin
export const getCompanyDetailsController = async (req, res) => {
    const { companyId } = req.params;
    const result = await getCompanyDetailsForAdmin(companyId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

// Get pending companies for approval
export const getPendingCompaniesController = async (req, res) => {
    const result = await getPendingCompaniesForAdmin();
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

// Get company job statistics
export const getCompanyJobStatsController = async (req, res) => {
    const { companyId } = req.params;
    const result = await getCompanyJobStats(companyId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
}; 