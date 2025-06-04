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

export const createJobForCompany = async (
    companyId,
    category,
    title,
    description,
    requirements,
    benefits,
    experienceYears,
    level,
    jobType,
    location,
    isRemote,
    salary,
    deadline
) => {
    try {
        const result = Job.create({
            company: companyId,
            category: category,
            title: title,
            description: description,
            requirements: requirements,
            benefits: benefits,
            experienceYears: experienceYears,
            level: level,
            jobType: jobType,
            location: location,
            isRemote: isRemote,
            salary: salary,
            deadline: deadline,
        });
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

export const expireJob = async (jobId, action) => {
    const job = await Job.findByIdAndUpdate(
        jobId,
        {
            isExpired: action,
        },
        { new: true }
    );
    if (!job) {
        return dataResponse(404, "can not find this job", null);
    }
    return dataResponse(200, "success", job);
};
