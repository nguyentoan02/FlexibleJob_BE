// src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { secret, expiresIn } from "../config/jwt.js";
import { generateToken, hashPassword, sendEmail } from "../utils/auth.util.js";
import Token from "../models/token.model.js";
import {
    createAccount,
    loginAccount,
    newPassword1,
    resetPasswordViaEmail,
    verifyResetToken,
} from "../service/auth.service.js";

const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

export const register = async (req, res) => {
    const { email, password, role } = req.body;

    const hashedPassword = await hashPassword(password);

    const result = await createAccount(email, hashedPassword, role);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const result = await loginAccount(email, password);

    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const resetPassword = async (req, res) => {
    const { email } = req.body;
    const result = await resetPasswordViaEmail(email);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const newPassword = async (req, res) => {
    const { token } = req.params;
    const { email, password } = req.body;
    const result = await newPassword1(token, email, password);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const verifyResetPasswordToken = async (req, res) => {
    const { token } = req.params;
    const result = await verifyResetToken(token);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

// NEW: Google OAuth Controller
export const googleAuth = (req, res) => {
    // Passport sẽ tự động chuyển hướng đến Google OAuth consent screen
    // Không cần logic ở đây.
};

export const googleAuthCallback = async (req, res) => {
    try {
        // req.user được set bởi Passport sau khi xác thực thành công
        const user = req.user;

        // Tạo JWT cho người dùng Google
        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.email },
            secret,
            { expiresIn }
        );

        // Chuyển hướng người dùng về frontend với token
        return res.redirect(
            `${process.env.FRONTEND_URL}/auth/google/success?token=${token}`
        );
    } catch (error) {
        console.error("Google Auth Callback Error:", error);
        return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=GoogleAuthFailed`
        );
    }
};
