import express from "express";
import {
    createJob,
    getAllJob,
    handleExpireJob,
    updateJob,
    viewListApplicant,
} from "../controllers/jobs.controller.js";
import auth from "../middlewares/auth.middleware.js";
import { isCompany } from "../middlewares/job.middleware.js";

const router = express.Router();

router.get("/", getAllJob);

router.post("/", createJob);

router.post("/expireJob/:jobId", handleExpireJob);

router.put("/:jobId", updateJob);

router.get("/:jobId", auth, isCompany, viewListApplicant);

export default router;
