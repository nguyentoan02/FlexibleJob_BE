import {
    followCompany,
    unfollowCompany,
    getFollowedCompanies,
} from "../service/followcompany.service.js";

export const followCompanyController = async (req, res) => {
    const userId = req.user.id;
    const { companyId } = req.params;
    const result = await followCompany(userId, companyId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const unfollowCompanyController = async (req, res) => {
    const userId = req.user.id;
    const { companyId } = req.params;
    const result = await unfollowCompany(userId, companyId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const getFollowedCompaniesController = async (req, res) => {
    const userId = req.user.id;
    const result = await getFollowedCompanies(userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};
