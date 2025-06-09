import CompanyProfile from "../models/companyprofile.model.js";

export const isCompany = async (req, res, next) => {
    const { id } = req.user;
    console.log(id);
    const result = await CompanyProfile.findOne({ user: id });
    console.log(result.isApproved);
    if (result.isApproved) {
        next();
    } else {
        return res
            .status(403)
            .json({ message: "your company dont have this job" });
    }
};
