import Job from "../models/jobs.model.js";

export const isCompany = async (req, res, next) => {
    const { userId } = req.user;
    const { jobId } = req.params;
    const result = await Job.findById(jobId)
        .select("company")
        .populate("company", "user");
    if (result.company.user === userId) {
        next();
    }
    return res.status(403).json({ message: "your company dont have this job" });
};
