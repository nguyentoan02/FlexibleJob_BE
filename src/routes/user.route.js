import { Router } from "express";
import { getAllUsers, getUserById, updateUserProfileById, banUser, unbanUser } from "../controllers/user.controller.js";
import auth from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = Router();

// Get all users
router.get("/", auth, getAllUsers);

// Ban/Unban user routes
router.put("/ban/:userId", auth, checkRole(["ADMIN"]), banUser);
router.put("/unban/:userId", auth, checkRole(["ADMIN"]), unbanUser);

// Get user by ID
router.get("/:userId", auth, getUserById);

// Update user profile
router.put("/:userId", auth, updateUserProfileById);

export default router; 