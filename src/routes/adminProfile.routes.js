import express from "express";
import multer from "multer";
import auth from "../middlewares/auth.middleware.js";
import { isRole } from "../middlewares/role.middleware.js";

import {
    getMyProfile,
    updateMyProfile,
} from "../controllers/profile.controller.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Routes chỉ cho ADMIN
router.get("/me", auth, isRole("ADMIN"), getMyProfile);

router.put(
    "/me",
    auth,
    isRole("ADMIN"),
    upload.single("profileImage"),
    updateMyProfile
);

export default router; 