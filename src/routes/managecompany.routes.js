import express from "express";
import multer from "multer";
import auth from "../middlewares/auth.middleware.js";
import { isRole } from "../middlewares/role.middleware.js";
import {
    createCompanyController,
    getMyCompanyController,
    updateMyCompanyController,
    deleteMyCompanyController,
} from "../controllers/manacompany.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
    "/",
    auth,
    isRole("EMPLOYER"),
    upload.fields([
        { name: "imageUrl", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
        { name: "albumImage", maxCount: 10 },
    ]),
    createCompanyController
);

router.get("/me", auth, isRole("EMPLOYER"), getMyCompanyController);

router.put(
    "/me",
    auth,
    isRole("EMPLOYER"),
    upload.fields([
        { name: "imageUrl", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
        { name: "albumImage", maxCount: 10 },
    ]),
    updateMyCompanyController
);

router.delete("/me", auth, isRole("EMPLOYER"), deleteMyCompanyController);

export default router;
