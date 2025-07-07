import express from "express";
import {
    createJob,
    getAllJob,
    getJobByCompany,
    getJobByJobId,
    getJobLimitationByUserId,
    getJobsByCompany,
    handleExpireJob,
    updateJob,
    viewJobsOfCompany,
    viewListApplicant,
} from "../controllers/jobs.controller.js";
import auth from "../middlewares/auth.middleware.js";
import { isCompany, isJobLimit } from "../middlewares/job.middleware.js";
import { isRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", auth, isRole("ADMIN"), getAllJob);

router.get("/limit", auth, isRole("EMPLOYER"), getJobLimitationByUserId);

router.post("/createJob", auth, isCompany, isJobLimit, createJob);

router.post("/expireJob/:jobId", handleExpireJob);

router.put("/:jobId", auth, isCompany, updateJob);

router.get("/:jobId", auth, isCompany, viewListApplicant);

router.get("/company/:companyId", viewJobsOfCompany);

router.get("/getJobs/ByCompany", auth, isCompany, getJobsByCompany);

router.get("/getJob/:jobId", getJobByJobId);

export default router;
