import FollowCompany from "../models/followcompany.model.js";
import CompanyProfile from "../models/companyprofile.model.js";

const dataResponse = (code, message, payload) => ({
    code,
    message,
    payload,
});

export const followCompany = async (userId, companyId) => {
    try {
        // Kiểm tra company tồn tại
        const company = await CompanyProfile.findById(companyId);
        if (!company) {
            return dataResponse(404, "Company not found", null);
        }
        // Tạo bản ghi follow (nếu chưa có)
        const follow = await FollowCompany.findOneAndUpdate(
            { user: userId, company: companyId },
            { user: userId, company: companyId },
            { upsert: true, new: true }
        );
        return dataResponse(200, "Followed company successfully", follow);
    } catch (err) {
        return dataResponse(500, err.message, null);
    }
};

export const unfollowCompany = async (userId, companyId) => {
    try {
        await FollowCompany.findOneAndDelete({
            user: userId,
            company: companyId,
        });
        return dataResponse(200, "Unfollowed company successfully", null);
    } catch (err) {
        return dataResponse(500, err.message, null);
    }
};

export const getFollowedCompanies = async (userId) => {
    try {
        const follows = await FollowCompany.find({ user: userId }).populate(
            "company"
        );
        return dataResponse(
            200,
            "Followed companies fetched",
            follows.map((f) => f.company)
        );
    } catch (err) {
        return dataResponse(500, err.message, null);
    }
};
