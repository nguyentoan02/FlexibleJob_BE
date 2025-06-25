import User from "../models/user.model.js";
import { sendEmail } from "../utils/auth.util.js";

// Ban a user account
export const banUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        if (!reason || reason.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Ban reason is required"
            });
        }
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        // Không cho phép ban ADMIN
        if (user.role === "ADMIN") {
            return res.status(403).json({ 
                success: false,
                message: "Cannot ban an admin account" 
            });
        }

        // Kiểm tra xem tài khoản đã bị ban chưa
        if (user.isBanned) {
            return res.status(400).json({ 
                success: false,
                message: "This account is already banned" 
            });
        }

        user.isBanned = true;
        user.banReason = reason;
        user.banAt = new Date();
        await user.save();

        // Gửi email thông báo ban
        await sendEmail(
            user.email,
            "Your account has been banned",
            `Your account has been banned for the following reason: ${reason}\nBan time: ${user.banAt.toLocaleString()}`
        );

        return res.status(200).json({ 
            success: true,
            message: "User has been banned successfully",
            data: {
                _id: user._id,
                email: user.email,
                role: user.role,
                isBanned: user.isBanned,
                banReason: user.banReason,
                banAt: user.banAt
            }
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Unban a user account
export const unbanUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        // Kiểm tra xem tài khoản đã được unban chưa
        if (!user.isBanned) {
            return res.status(400).json({ 
                success: false,
                message: "This account is not banned" 
            });
        }

        user.isBanned = false;
        await user.save();

        return res.status(200).json({ 
            success: true,
            message: "User has been unbanned successfully",
            data: {
                _id: user._id,
                email: user.email,
                role: user.role,
                isBanned: user.isBanned
            }
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}; 