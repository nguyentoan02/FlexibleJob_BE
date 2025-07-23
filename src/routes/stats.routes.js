import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { isRole } from "../middlewares/role.middleware.js";
import {
  companiesByMonthController,
  revenueByMonthController,
  topCompaniesByJobsController,
  recentActivityController,
  userTypeRatioController,
  jobsByMonthController
} from "../controllers/stats.controller.js";

const router = express.Router();

// Chỉ cho ADMIN truy cập
router.use(auth, isRole("ADMIN"));

router.get("/companies-by-month", companiesByMonthController);
router.get("/revenue-by-month", revenueByMonthController);
router.get("/top-companies-by-jobs", topCompaniesByJobsController);
router.get("/recent-activity", recentActivityController);
router.get("/user-type-ratio", userTypeRatioController);
router.get("/jobs-by-month", jobsByMonthController);

export default router; 