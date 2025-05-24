import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { isRole } from "../middlewares/role.middleware.js";
import {
    getAllUsers,
    getUserById,
    updateUserProfileById,
} from "../controllers/user.controller.js";
import { checkUserId } from "../middlewares/user.middleware.js";

const router = express.Router();

router.get("/", auth, isRole("ADMIN"), getAllUsers);

router.get("/:userId", getUserById);

router.put("/userId", auth, checkUserId, updateUserProfileById);

export default router;
