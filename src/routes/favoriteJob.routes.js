import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { isRole } from "../middlewares/role.middleware.js";
import {
    addJobToFavorites,
    getMyFavoriteJobs,
    removeJobFromFavorites,
    checkJobFavoriteStatus,
} from "../controllers/favoriteJob.controller.js";

const router = express.Router();

// All routes require authentication and JOBSEEKER role
router.use(auth);
router.use(isRole("JOBSEEKER"));

// Add job to favorites
router.post("/:jobId", addJobToFavorites);

// Get user's favorite jobs
router.get("/", getMyFavoriteJobs);

// Remove job from favorites
router.delete("/:jobId", removeJobFromFavorites);

// Check if job is favorited
router.get("/:jobId/status", checkJobFavoriteStatus);

export default router;
