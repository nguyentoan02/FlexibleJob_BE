import express from "express";
import { getCompanyById } from "../controllers/company.controler.js";

const router = express.Router();

router.get("/:companyId", getCompanyById);

export default router;
