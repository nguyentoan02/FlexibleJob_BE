import express from "express";
import {
    createCompanyProfile,
    getCompanyById,
} from "../controllers/company.controler.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get("/:companyId", getCompanyById);
router.post(
    "/",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
        { name: "albumImage", maxCount: 10 },
        { name: "identityImage", maxCount: 10 },
    ]),
    createCompanyProfile
);

export default router;
