import express from "express";
import {
    getCompanyApprovalStatsController,
    getCompanyListController,
    updateCompanyApprovalController,
    deleteCompanyController,
    getCompanyDetailsController,
    getPendingCompaniesController
} from "../controllers/adminCompany.controller.js";
import auth from "../middlewares/auth.middleware.js";
import { isRole } from "../middlewares/role.middleware.js";

const router = express.Router();

// All routes require ADMIN role
router.use(auth);
router.use(isRole("ADMIN"));

// Get company approval statistics
router.get("/stats", getCompanyApprovalStatsController);

// Get all companies with optional filters
router.get("/list", getCompanyListController);

// Update company approval status
router.patch("/approve/:companyId", updateCompanyApprovalController);

// Delete company
router.delete("/:companyId", deleteCompanyController);

// Get company details for admin
router.get("/:companyId", getCompanyDetailsController);

// Get pending companies for approval
router.get("/pending-approvals", getPendingCompaniesController);

export default router; 