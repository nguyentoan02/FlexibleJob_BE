import express from "express";
import { searchJobsController } from "../controllers/searchJob.controller.js";

const router = express.Router();

router.get("/", searchJobsController);

export default router;
