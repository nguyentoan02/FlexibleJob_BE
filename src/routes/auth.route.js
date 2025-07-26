import { Router } from "express";
import { login, register, refreshToken, logout, googleLogin } from "../controllers/auth.controller.js";
import { checkBanStatus } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login, checkBanStatus);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/google-login", googleLogin, checkBanStatus);

export default router; 