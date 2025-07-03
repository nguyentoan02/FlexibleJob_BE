import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { isRole } from "../middlewares/role.middleware.js";
import {
    getAllPackagesController,
    createPackageController,
    updatePackageController,
    deletePackageController
} from "../controllers/package.controller.js";

const router = express.Router();

// Public routes
router.get("/", getAllPackagesController);

// Admin routes (cần auth và role ADMIN)
router.post("/", auth, isRole("ADMIN"), createPackageController);
router.put("/:packageId", auth, isRole("ADMIN"), updatePackageController);
router.delete("/:packageId", auth, isRole("ADMIN"), deletePackageController);

export default router; 