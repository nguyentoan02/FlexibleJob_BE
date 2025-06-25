import express from "express";
import {
    createCompanyProfile,
    getCompanyById,
    getMyCompany,
    updateCompany,
} from "../controllers/company.controler.js";
import multer from "multer";
import auth from "../middlewares/auth.middleware.js";
import { isRole } from "../middlewares/role.middleware.js";
import { isApproved } from "../middlewares/company.middleware.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get("/myCompany", auth, isRole("EMPLOYER"), getMyCompany); //get My own company dumami
router.get("/:companyId", getCompanyById); //Jobseeker get company via companyId
router.post(
    "/",
    auth,
    isRole("EMPLOYER"),
    // isApproved, tao vẫn chưa hiểu cái củ địt này lắm ....
    upload.fields([
        { name: "imageUrl", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
        { name: "albumImage", maxCount: 10 },
        { name: "identityImage", maxCount: 10 },
    ]),
    createCompanyProfile
);

router.put(
    "/",
    auth,
    isRole("EMPLOYER"),
    upload.fields([
        { name: "imageUrl", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
        { name: "albumImage", maxCount: 10 },
    ]),
    updateCompany
);

export default router;
