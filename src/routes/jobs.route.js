import express from "express";
import {
    createJob,
    getAllJob,
    handleExpireJob,
} from "../controllers/jobs.controller.js";

const router = express.Router();

router.get("/", getAllJob);

router.post("/", createJob);

router.post("/expireJob/:jobId", handleExpireJob);

export default router;
