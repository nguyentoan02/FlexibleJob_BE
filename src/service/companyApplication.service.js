import Application from "../models/application.model.js";
import CompanyProfile from "../models/companyprofile.model.js";
import Job from "../models/jobs.model.js";
import User from "../models/user.model.js";

const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

async function populateCvSnapshotUserAndJob(applications) {
    if (!applications || applications.length === 0) return applications;

    // Lấy tất cả userId từ cvSnapshot
    const userIds = applications
        .map((app) => app.cvSnapshot?.user)
        .filter((id) => !!id);

    // Lấy tất cả jobId từ application
    const jobIds = applications.map((app) => app.job).filter((id) => !!id);

    // Lấy thông tin user
    const users = await User.find({ _id: { $in: userIds } })
        .select("firstName lastName email imageUrl")
        .lean();
    const userMap = {};
    users.forEach((u) => {
        userMap[u._id.toString()] = u;
    });

    // Lấy thông tin job (chỉ lấy title)
    const jobs = await Job.find({ _id: { $in: jobIds } })
        .select("_id title")
        .lean();
    const jobMap = {};
    jobs.forEach((j) => {
        jobMap[j._id.toString()] = j.title;
    });

    // Gán thông tin user vào cvSnapshot và jobTitle vào application
    applications.forEach((app) => {
        if (app.cvSnapshot && app.cvSnapshot.user) {
            const userId = app.cvSnapshot.user.toString();
            app.cvSnapshot.user = userMap[userId] || null;
        }
        if (app.job) {
            const jobId = app.job.toString();
            app.jobTitle = jobMap[jobId] || null;
        }
    });

    return applications;
}

const helper1 = async (userId) => {
    const companyId = await CompanyProfile.exists({ user: userId });
    if (!companyId) return dataResponse(404, "can not find this company");
    const jobsOfCompany = await Job.find({ company: companyId }).select("_id");
    return jobsOfCompany;
};

export const getAllApplicationOfCompany = async (page, limit, userId) => {
    const jobsOfCompany = await helper1(userId);
    let allApps = await Application.find({ job: { $in: jobsOfCompany } })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .lean();
    allApps = await populateCvSnapshotUserAndJob(allApps);

    const count = await Application.countDocuments({
        job: { $in: jobsOfCompany },
    });
    const payload = {
        applications: allApps,
        totalPage: Math.ceil(count / limit),
        currentPage: page,
    };
    return dataResponse(200, "found all application for", payload);
};

export const getAcceptedApplicationOfCompany = async (page, limit, userId) => {
    const jobsOfCompany = await helper1(userId);
    let acceptedApps = await Application.find({
        job: { $in: jobsOfCompany },
        status: "HIRED",
    })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .lean();
    acceptedApps = await populateCvSnapshotUserAndJob(acceptedApps);
    const count = await Application.countDocuments({
        job: { $in: jobsOfCompany },
        status: "HIRED",
    });
    const payload = {
        acceptedApplications: acceptedApps,
        totalPage: Math.ceil(count / limit),
        currentPage: page,
    };
    return dataResponse(200, "found all accepted application for", payload);
};

export const getRejectedApplicationOfCompany = async (page, limit, userId) => {
    const jobsOfCompany = await helper1(userId);
    let rejectedApps = await Application.find({
        job: { $in: jobsOfCompany },
        status: "REJECTED",
    })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .lean();
    rejectedApps = await populateCvSnapshotUserAndJob(rejectedApps);
    const count = await Application.countDocuments({
        job: { $in: jobsOfCompany },
        status: "REJECTED",
    });
    const payload = {
        rejectedApplications: rejectedApps,
        totalPage: Math.ceil(count / limit),
        currentPage: page,
    };
    return dataResponse(200, "found all rejected application for", payload);
};

export const getAllApplyApplicationOfCompany = async (page, limit, userId) => {
    const jobsOfCompany = await helper1(userId);
    let appliedApps = await Application.find({
        job: { $in: jobsOfCompany },
        status: "APPLIED",
    })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .lean();
    appliedApps = await populateCvSnapshotUserAndJob(appliedApps);
    const count = await Application.countDocuments({
        job: { $in: jobsOfCompany },
        status: "APPLIED",
    });
    const payload = {
        appliedApplications: appliedApps,
        totalPage: Math.ceil(count / limit),
        currentPage: page,
    };
    return dataResponse(200, "found all applied application for", payload);
};
