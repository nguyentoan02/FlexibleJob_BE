import CompanyProfile from "../models/companyprofile.model.js";

export const isApproved = async (req, res, next) => {
    const { userId } = req.user;
    const result = await CompanyProfile.findOne({ user: userId });
    if (result.isApproved) {
        next();
    }
    return res
        .status(400)
        .json({ message: "your company must approve by admin" });
};
