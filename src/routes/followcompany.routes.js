import express from "express";
import auth from "../middlewares/auth.middleware.js";
import {
    followCompanyController,
    unfollowCompanyController,
    getFollowedCompaniesController,
} from "../controllers/followcompany.controller.js";

const router = express.Router();

router.post("/:companyId", auth, followCompanyController); // Follow company
router.delete("/:companyId", auth, unfollowCompanyController); // Unfollow company
router.get("/", auth, getFollowedCompaniesController); // Get all followed companies

export default router;
