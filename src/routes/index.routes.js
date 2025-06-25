import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import companyRoutes from "./company.routes.js";
import forgotPasswordRoutes from "./forgotPassword.routes.js";
import profileRoutes from "./profile.routes.js";
import banRoutes from "./ban.routes.js";
import jobRoutes from "./jobs.route.js";
import categoryRoutes from "./category.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/users/status", banRoutes);
router.use("/company", companyRoutes);
router.use("/forgot-password", forgotPasswordRoutes);
router.use("/profile", profileRoutes);
router.use("/admin/profile", profileRoutes);
router.use("/jobs", jobRoutes);
router.use("/category", categoryRoutes);

export default router;
