// src/routes/application.routes.js
import express from "express";
import auth, { isRole } from "../middlewares/auth.middleware.js";
import {
    applyToJob,
    changeApplicationStatus,
    getMyApplicationsList,
    getApplicantAnalysis,
} from "../controllers/applications.controller.js";

const router = express.Router();

// Route nộp đơn ứng tuyển
router.post("/apply/:jobId", auth, isRole("JOBSEEKER"), applyToJob);

// Route mới để lấy danh sách đơn ứng tuyển
router.get(
    "/my-applications",
    auth,
    isRole("JOBSEEKER"),
    getMyApplicationsList
);

router.patch(
    "/changeStatus/:applicationId",
    auth,
    isRole("EMPLOYER"),
    changeApplicationStatus
);

router.get("/analyze/:jobId", auth, isRole("EMPLOYER"), getApplicantAnalysis);

export default router;
