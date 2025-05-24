import { getCompanyProfile } from "../service/company.service.js";

export const getCompanyById = async (req, res) => {
    const { companyId } = req.params;
    const result = await getCompanyProfile(companyId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const updateCompany = async (req, res) => {
    const { companyId } = req.params;
    const { companyName, aboutUs, address, identityImage } = req.body;
};
