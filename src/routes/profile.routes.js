import express from "express";
import multer from "multer";
import auth from "../middlewares/auth.middleware.js";
import { profileAuth } from "../middlewares/profileAuth.middleware.js";

import {
    getMyProfile,
    updateMyProfile,
} from "../controllers/profile.controller.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/me", auth, profileAuth, getMyProfile);

router.put(
    "/me",
    auth,
    profileAuth,
    upload.single("profileImage"),
    updateMyProfile
);

export default router;
