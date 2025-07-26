import express from "express";
import {
    createCategory,
    getAllCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", getAllCategory);
router.post("/", createCategory);

export default router;
