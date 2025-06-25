import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { isRole } from "../middlewares/role.middleware.js";
import {
    getAllUsers,
    getActiveUsers,
    getBannedUsers,
    getUserById,
    updateUserProfileById,
    changePassword
} from "../controllers/user.controller.js";
import { checkUserId } from "../middlewares/user.middleware.js";

const router = express.Router();

// User management routes (Admin only)
router.get("/", auth, isRole("ADMIN"), getAllUsers);
router.get("/banned", auth, isRole("ADMIN"), getBannedUsers);

// User access routes
router.get("/active", auth, getActiveUsers);
router.get("/:userId", getUserById);

// Profile management routes
router.put("/:userId", auth, checkUserId, updateUserProfileById);
router.post("/change-password", auth, changePassword);

export default router;
