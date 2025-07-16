import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { isRole } from "../middlewares/role.middleware.js";
import {
    getAllUsers,
    getActiveUsers,
    getBannedUsers,
    getUserById,
    updateUserProfileById,
    changePassword,
    getTotalUsersController,
    getTotalEmployersController,
    getTotalJobseekersController,
    getTotalCompaniesController
} from "../controllers/user.controller.js";
import { checkUserId } from "../middlewares/user.middleware.js";

const router = express.Router();

// User management routes (Admin only)
router.get("/", auth, isRole("ADMIN"), getAllUsers);
router.get("/banned", auth, isRole("ADMIN"), getBannedUsers);

// Thống kê tổng số user, employer, jobseeker, công ty (chỉ ADMIN)
router.get("/total-users", auth, isRole("ADMIN"), getTotalUsersController);
router.get("/total-employers", auth, isRole("ADMIN"), getTotalEmployersController);
router.get("/total-jobseekers", auth, isRole("ADMIN"), getTotalJobseekersController);
router.get("/total-companies", auth, isRole("ADMIN"), getTotalCompaniesController);

// User access routes
router.get("/active", auth, getActiveUsers);
router.get("/:userId", getUserById);

// Profile management routes
router.put("/:userId", auth, checkUserId, updateUserProfileById);
router.post("/change-password", auth, changePassword);

export default router;
