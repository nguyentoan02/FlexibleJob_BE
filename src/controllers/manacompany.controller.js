import {
    createCompany,
    getCompanyByUserId,
    updateCompanyByUserId,
    deleteCompanyByUserId,
} from "../service/managecompany.service.js";

export const createCompanyController = async (req, res) => {
    const userId = req.user.id;
    const data = req.body;
    const files = req.files;

    const result = await createCompany(userId, data, files);
    res.status(result.code).json(result);
};

export const getMyCompanyController = async (req, res) => {
    const userId = req.user.id;
    const result = await getCompanyByUserId(userId);
    res.status(result.code).json(result);
};

export const updateMyCompanyController = async (req, res) => {
    const userId = req.user.id;
    const data = req.body;
    const files = req.files;

    const result = await updateCompanyByUserId(userId, data, files);
    res.status(result.code).json(result);
};

export const deleteMyCompanyController = async (req, res) => {
    const userId = req.user.id;
    const result = await deleteCompanyByUserId(userId);
    res.status(result.code).json(result);
};
