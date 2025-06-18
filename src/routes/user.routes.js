import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { isRole } from "../middlewares/role.middleware.js";
import {
    getAllUsers,
    getUserById,
    updateUserProfileById,
    changePassword
} from "../controllers/user.controller.js";
import { checkUserId } from "../middlewares/user.middleware.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
    res.json({ message: "User routes are working" });
});

router.get("/", auth, isRole("ADMIN"), getAllUsers);

router.get("/:userId", getUserById);

router.put("/:userId", auth, checkUserId, updateUserProfileById);

router.post("/change-password", auth, changePassword);

export default router;
