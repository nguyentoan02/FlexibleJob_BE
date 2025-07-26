import bcrypt from "bcryptjs";
import User from "../models/user.model.js"; // Your existing User model
import PasswordResetToken from "../models/passwordResetToken.model.js"; // The new or modified token model
import { generateToken, hashPassword, sendEmail } from "../utils/auth.util.js"; // Your existing utilities
import dotenv from "dotenv";

dotenv.config();

const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

/**
 * Initiates the new password reset process by sending a reset email.
 * @param {string} email - The user's email address.
 */
export const requestNewPasswordReset = async (email) => {
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            // It's a good security practice to respond generically even if the email isn't found
            // to prevent email enumeration.
            return dataResponse(
                200,
                "If an account with that email exists, a password reset link has been sent.",
                null
            );
        }

        // Delete any existing reset tokens for this user to ensure only one is active
        await PasswordResetToken.deleteMany({ userId: user._id });

        const resetToken = generateToken(); // Generate a random token
        const newPasswordResetToken = await PasswordResetToken.create({
            token: resetToken,
            userId: user._id,
        });

        if (newPasswordResetToken) {
            const resetLink = `${process.env.FRONTEND_URL}/new-forgot-password/${resetToken}`;
            const emailSubject = "New Password Reset Request for Your Account";
            const emailText = `You recently requested to reset your password. Click this link to complete the process: ${resetLink}. This link is valid for 1 hour. If you did not request a password reset, please ignore this email.`;

            const sendResult = await sendEmail(email, emailSubject, emailText);

            // Return success even if email sending fails to avoid revealing user existence
            if (sendResult.code !== 200) {
                console.error(
                    "Failed to send password reset email:",
                    sendResult.message
                );
            }
            return dataResponse(
                200,
                "If an account with that email exists, a password reset link has been sent.",
                null
            );
        } else {
            return dataResponse(
                500,
                "Server error: Could not create reset token.",
                null
            );
        }
    } catch (err) {
        console.error("Error in requestNewPasswordReset service:", err);
        return dataResponse(
            500,
            `Server error during password reset request: ${err.message}`,
            null
        );
    }
};

/**
 * Verifies the validity of the new password reset token.
 * @param {string} token - The reset token from the URL.
 */
export const verifyNewPasswordResetToken = async (token) => {
    try {
        const tokenDoc = await PasswordResetToken.findOne({
            token: token,
        }).populate("userId");

        if (!tokenDoc) {
            return dataResponse(
                400,
                "Invalid or expired password reset token.",
                null
            );
        }

        // Token is valid and has not expired (Mongoose TTL handles expiry check)
        return dataResponse(200, "Token is valid.", {
            email: tokenDoc.userId.email,
        });
    } catch (err) {
        console.error("Error in verifyNewPasswordResetToken service:", err);
        return dataResponse(
            500,
            `Server error during token verification: ${err.message}`,
            null
        );
    }
};

/**
 * Sets a new password for the user after token verification.
 * @param {string} token - The reset token.
 * @param {string} email - The user's email.
 * @param {string} newPassword - The new password.
 */
export const setNewPasswordWithToken = async (token, newPassword) => {
    try {
        const tokenDoc = await PasswordResetToken.findOne({
            token: token,
        }).populate("userId");

        if (!tokenDoc) {
            return dataResponse(
                400,
                "Invalid or expired password reset token.",
                null
            );
        }

        const user = tokenDoc.userId;

        const hashedPassword = await hashPassword(newPassword);

        user.password = hashedPassword;
        await user.save();

        // Invalidate the token after successful password reset
        await PasswordResetToken.deleteOne({ _id: tokenDoc._id });

        return dataResponse(200, "Password has been successfully reset.", null);
    } catch (err) {
        console.error("Error in setNewPasswordWithToken service:", err);
        return dataResponse(
            500,
            `Server error during new password setting: ${err.message}`,
            null
        );
    }
};
