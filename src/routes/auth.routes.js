// auth.routes.js
import express from "express";
import {
    register,
    login,
    resetPassword,
    verifyResetPasswordToken,
    newPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/resetPassword/", resetPassword);
router.post("/updatePassword/:token", newPassword);
router.get("/verifyToken/:token", verifyResetPasswordToken);

export default router;
