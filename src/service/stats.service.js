import CompanyProfile from "../models/companyprofile.model.js";
import Payment from "../models/payment.model.js";
import Job from "../models/jobs.model.js";
import Application from "../models/application.model.js";
import User from "../models/user.model.js";

function getLast12Months() {
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return months;
}

export const getCompaniesByMonth = async () => {
  const months = getLast12Months();
  const data = await CompanyProfile.aggregate([
    { $group: {
      _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      count: { $sum: 1 }
    }}
  ]);
  return months.map(({ year, month }) => {
    const found = data.find(d => d._id.year === year && d._id.month === month);
    return { month: `${year}-${String(month).padStart(2, "0")}`, count: found ? found.count : 0 };
  });
};

export const getRevenueByMonth = async () => {
  const months = getLast12Months();
  const data = await Payment.aggregate([
    { $match: { status: "PENDING" } },
    { $group: {
      _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      total: { $sum: "$amount" }
    }}
  ]);
  return months.map(({ year, month }) => {
    const found = data.find(d => d._id.year === year && d._id.month === month);
    return { month: `${year}-${String(month).padStart(2, "0")}`, total: found ? found.total : 0 };
  });
};

export const getTopCompaniesByJobs = async (limit = 5) => {
  return await Job.aggregate([
    { $group: { _id: "$company", jobCount: { $sum: 1 } } },
    { $sort: { jobCount: -1 } },
    { $limit: limit },
    { $lookup: { from: "companyprofiles", localField: "_id", foreignField: "_id", as: "company" } },
    { $unwind: "$company" },
    { $project: { companyId: "$company._id", companyName: "$company.companyName", jobCount: 1 } }
  ]);
};

export const getRecentActivity = async (limit = 10) => {
  // 1. User đăng ký
  const userRegs = await User.find({ role: { $ne: "ADMIN" } })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("firstName lastName createdAt");
  const userActivities = userRegs.map(u => ({
    type: "user_register",
    message: `User ${u.firstName} ${u.lastName} registered`,
    createdAt: u.createdAt
  }));

  // 2. User bị ban
  const bannedUsers = await User.find({ isBanned: true })
    .sort({ banAt: -1 })
    .limit(5)
    .select("firstName lastName banAt updatedAt");
  const banActivities = bannedUsers.map(u => ({
    type: "user_banned",
    message: `User ${u.firstName} ${u.lastName} was banned`,
    createdAt: u.banAt || u.updatedAt || new Date()
  }));

  // 3. User được unban
  const unbannedUsersRaw = await User.find({ isBanned: false, banAt: { $ne: null } })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select("firstName lastName banAt updatedAt");
  const unbanActivities = unbannedUsersRaw
    .filter(u => u.updatedAt > u.banAt)
    .map(u => ({
      type: "user_unbanned",
      message: `User ${u.firstName} ${u.lastName} was unbanned`,
      createdAt: u.updatedAt
    }));

  // 4. Công ty đăng job
  const jobs = await Job.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("company", "companyName")
    .select("company createdAt");
  const jobActivities = jobs.map(j => ({
    type: "company_post_job",
    message: `Company ${j.company?.companyName || "Unknown"} posted a new job`,
    createdAt: j.createdAt
  }));

  // 5. Mua package (SUCCESS)
  const paymentsSuccess = await Payment.find({ status: "SUCCESS" })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId", "firstName lastName")
    .select("userId createdAt");
  const paymentSuccessActivities = paymentsSuccess.map(p => ({
    type: "package_purchase_success",
    message: `Package purchased by ${p.userId?.firstName || "Unknown"} ${p.userId?.lastName || ""}`.trim(),
    createdAt: p.createdAt
  }));

  // 6. Ứng tuyển job
  const applications = await Application.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "firstName lastName")
    .select("user createdAt");
  const appActivities = applications.map(a => ({
    type: "job_application",
    message: `Job application received from ${a.user?.firstName || "Unknown"} ${a.user?.lastName || ""}`.trim(),
    createdAt: a.createdAt
  }));

  // Gộp, sort theo createdAt, lấy limit hoạt động mới nhất
  const all = [
    ...userActivities,
    ...banActivities,
    ...unbanActivities,
    ...jobActivities,
    ...paymentSuccessActivities,
    ...appActivities
  ];
  all.sort((a, b) => b.createdAt - a.createdAt);
  return all.slice(0, limit);
};

export const getUserTypeRatio = async () => {
  const [employer, jobseeker] = await Promise.all([
    // Đếm số lượng user theo role
    // Nếu không có model User, cần import lại
    (await import("../models/user.model.js")).default.countDocuments({ role: "EMPLOYER" }),
    (await import("../models/user.model.js")).default.countDocuments({ role: "JOBSEEKER" })
  ]);
  return { employer, jobseeker };
};

export const getJobsByMonth = async () => {
  const months = getLast12Months();
  const data = await Job.aggregate([
    { $group: {
      _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      count: { $sum: 1 }
    }}
  ]);
  return months.map(({ year, month }) => {
    const found = data.find(d => d._id.year === year && d._id.month === month);
    return { month: `${year}-${String(month).padStart(2, "0")}`, count: found ? found.count : 0 };
  });
}; 