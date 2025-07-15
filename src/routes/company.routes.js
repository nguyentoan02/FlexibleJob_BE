import express from "express";
import {
    approveCompanyById,
    getCompanyById,
    getMyCompany,
    getPendingCompaniesForAdmin,
    isCompanyApproved,
    updateCompany,
} from "../controllers/company.controler.js";
import multer from "multer";
import auth from "../middlewares/auth.middleware.js";
import { isRole } from "../middlewares/role.middleware.js";
import { isApproved } from "../middlewares/company.middleware.js";
import { fetchCvProfileWithUserDetails } from "../controllers/cvProfile.controller.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Admin routes
router.get(
    "/admin/pending-approvals",
    auth,
    isRole("ADMIN"),
    getPendingCompaniesForAdmin
);
router.patch(
    "/admin/approve/:companyId",
    auth,
    isRole("ADMIN"),
    approveCompanyById
);

// Employer routes
router.get("/myCompany", auth, isRole("EMPLOYER"), getMyCompany);
router.get("/isCompanyApproved", auth, isRole("EMPLOYER"), isCompanyApproved);
router.put(
    "/",
    auth,
    isRole("EMPLOYER"),
    upload.fields([
        { name: "imageUrl", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
        { name: "albumImage", maxCount: 10 },
        { name: "identityImage", maxCount: 10 },
    ]),
    updateCompany
);
router.get(
    "/:cvProfileId/details",
    auth,
    isRole("EMPLOYER"),
    fetchCvProfileWithUserDetails
);

// Public routes
router.get("/:companyId", getCompanyById);

export default router;
