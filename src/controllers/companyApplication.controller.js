import {
    getAcceptedApplicationOfCompany,
    getAllApplicationOfCompany,
    getAllApplyApplicationOfCompany,
    getRejectedApplicationOfCompany,
} from "../service/companyApplication.service.js";

export const getAllApplication = async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getAllApplicationOfCompany(page, limit, userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const getAllAcceptedApplication = async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getAcceptedApplicationOfCompany(page, limit, userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const getAllRejectedApplication = async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getRejectedApplicationOfCompany(page, limit, userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const getAllAppliedApplication = async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getAllApplyApplicationOfCompany(page, limit, userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};
