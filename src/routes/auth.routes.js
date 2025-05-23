// auth.routes.js
import express from "express";
import {
    register,
    login,
    resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/resetPassword", resetPassword);

export default router;
