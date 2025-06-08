import CompanyProfile from "../models/companyprofile.model.js";
import Job from "../models/jobs.model.js";

const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

export const getAllAvailableJobs = async (page, limit) => {
    const jobs = await Job.find({ isExpire: false })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
    const count = await Job.countDocuments();
    const payload = {
        jobs: jobs,
        totalPage: Math.ceil(count / limit),
        currentPage: page,
    };
    return dataResponse(200, "All jobs available", payload);
};

export const createJobForCompany = async (data) => {
    try {
        const result = Job.create(data);
        return dataResponse(200, "create job success", result);
    } catch (error) {
        return dataResponse(500, error.message, null);
    }
};

export const getJobByCompanyId = async (companyId) => {
    const isCompanyExist = await CompanyProfile.exists(companyId);
    if (isCompanyExist) {
        const jobs = await Job.find({
            company: companyId,
        });
        return dataResponse(200, "found", jobs);
    }
    return 404, "company not found", null;
};

export const expireJob = async (jobId, action, date) => {
    const job = await Job.findByIdAndUpdate(
        jobId,
        {
            isExpired: action,
            expiredAt: date,
        },
        { new: true }
    );
    if (!job) {
        return dataResponse(404, "can not find this job", null);
    }
    return dataResponse(200, "success", job);
};

export const getListApplicant = async (jobId) => {
    const applicants = await Job.findById(jobId)
        .select("applicants")
        .populate({
            path: "applicants",
            populate: [{ path: "cv" }, { path: "user" }],
        });
    if (!applicants) {
        return dataResponse(404, "Job not found", null);
    }
    return dataResponse(200, "Success", applicants);
};

export const updateJobByJobId = async (jobId, data) => {
    const updatedJob = await Job.findByIdAndUpdate(
        jobId,
        { data },
        { new: true }
    );
    if (!updatedJob) {
        return dataResponse(404, "not found this job", null);
    }
    return dataResponse(200, "job updated");
};

export const getJobs = async (companyId) => {
    const jobs = await Job.find({
        company: companyId,
    });
    return dataResponse(200, "success", jobs);
};
