// src/routes/auth.routes.js
import express from "express";
import {
    register,
    login,
    resetPassword,
    verifyResetPasswordToken,
    newPassword,
    googleAuth,
    googleAuthCallback,
    verifyEmailController,
} from "../controllers/auth.controller.js";
import passport from "passport";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/resetPassword/", resetPassword);
router.post("/updatePassword/:token", newPassword);
router.get("/verifyToken/:token", verifyResetPasswordToken);
router.get("/verify-email/:token", verifyEmailController);

// Google OAuth routes
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login",
        session: false,
    }),
    googleAuthCallback
);

export default router;
