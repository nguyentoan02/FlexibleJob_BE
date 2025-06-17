// src/routes/application.routes.js
import express from "express";
import auth, { isRole } from "../middlewares/auth.middleware.js";

import { applyToJob } from "../controllers/applications.controller.js"; // Chỉ import applyToJob

const router = express.Router();

// Route duy nhất: Nộp đơn ứng tuyển cho JOBSEEKER
router.post("/apply/:jobId", auth, isRole("JOBSEEKER"), applyToJob);

export default router;
