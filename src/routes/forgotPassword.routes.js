import express from "express";
import {
    requestNewReset,
    verifyNewResetToken,
    setNewPassword,
} from "../controllers/forgotPassword.controller.js";

const router = express.Router();

// Route to request a new password reset email
router.post("/request-reset", requestNewReset);

// Route to verify the new password reset token (usually a GET request when the frontend loads the reset page)
router.get("/verify-token/:token", verifyNewResetToken);

// Route to set the new password using the token
router.post("/set-new-password/:token", setNewPassword);

export default router;
