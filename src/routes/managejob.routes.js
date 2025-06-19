import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { isRole } from "../middlewares/role.middleware.js";
import { checkCompanyApproval } from "../middlewares/company.middleware.js";
import {
    createJobController,
    updateJobController,
    getCompanyJobsController,
    getJobByIdController,
} from "../controllers/managejob.controller.js";

const router = express.Router();

// Apply middleware cho tất cả các routes
router.use(auth);
router.use(isRole("EMPLOYER"));
router.use(checkCompanyApproval);

// Routes
router.post("/", createJobController);
router.put("/:jobId", updateJobController);
router.get("/", getCompanyJobsController);
router.get("/:jobId", getJobByIdController);

export default router;
