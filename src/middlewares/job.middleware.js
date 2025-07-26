import CompanyProfile from "../models/companyprofile.model.js";
import LimitJobs from "../models/limitJobs.model.js";

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

export const isJobLimit = async (req, res, next) => {
    const { id } = req.user;
    const companyId = await CompanyProfile.findOne({ user: id }).select("_id");
    console.log(companyId);
    if (companyId._id) {
        const jobLimit = await LimitJobs.findOneAndUpdate(
            { company: companyId },
            { $inc: { posted: 1 } },
            { new: true }
        );
        if (jobLimit.limit === jobLimit.posted) {
            return res.status(400).json({
                message: "this company reach their jobs limit",
            });
        }
        next();
    } else {
        return res.status(404).json({ message: "can not find this company" });
    }
};
