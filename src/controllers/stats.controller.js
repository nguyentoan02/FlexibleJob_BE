import { getCompaniesByMonth, getRevenueByMonth, getTopCompaniesByJobs, getRecentActivity, getUserTypeRatio, getJobsByMonth } from "../service/stats.service.js";

export const companiesByMonthController = async (req, res) => {
  res.json(await getCompaniesByMonth());
};
export const revenueByMonthController = async (req, res) => {
  res.json(await getRevenueByMonth());
};
export const topCompaniesByJobsController = async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  res.json(await getTopCompaniesByJobs(limit));
};
export const recentActivityController = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  res.json(await getRecentActivity(limit));
};
export const userTypeRatioController = async (req, res) => {
  res.json(await getUserTypeRatio());
};
export const jobsByMonthController = async (req, res) => {
  res.json(await getJobsByMonth());
}; 