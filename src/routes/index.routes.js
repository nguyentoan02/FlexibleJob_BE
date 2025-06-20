import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import companyRoutes from "./company.routes.js";
import forgotPasswordRoutes from "./forgotPassword.routes.js";
import profileRoutes from "./profile.routes.js";
import jobRoutes from "./jobs.routes.js";
import categoryRoutes from "./category.routes.js";
import cvProfileRoutes from "./cvProfile.routes.js";
import applicationRoutes from "./application.routes.js";
const router = express.Router();

import jobRoute from "./jobs.route.js";

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/company", companyRoutes);
router.use("/forgot-password", forgotPasswordRoutes);
router.use("/profile", profileRoutes);
router.use("/job", jobRoutes);

router.use("/jobs", jobRoute);
router.use("/category", categoryRoutes);
router.use("/cv-profiles", cvProfileRoutes); // Thêm CV Profile routes
router.use("/applications", applicationRoutes);
export default router;
