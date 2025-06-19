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

export const checkCompanyApproval = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const company = await CompanyProfile.findOne({ user: userId });

        if (!company) {
            return res.status(404).json({
                message: "Company profile not found",
            });
        }

        if (!company.isApproved) {
            return res.status(403).json({
                message: "Company profile needs to be approved by admin first",
            });
        }

        req.company = company; // Attach company to request for later use
        next();
    } catch (error) {
        console.error("Error in checkCompanyApproval middleware:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
