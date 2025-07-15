import jwt from "jsonwebtoken";
import { secret } from "../config/jwt.js";
import User from "../models/user.model.js";

const auth = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Middleware to check if user is banned
export const checkBanStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isBanned) {
      return res.status(403).json({ 
        message: "Your account has been banned. Please contact administrator for more information." 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export default auth;
// isRole middleware của bạn
export const isRole = (role) => {
    return (req, res, next) => {
        // Đảm bảo req.user và req.user.role đã được thiết lập bởi middleware 'auth'
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};

export const optionalAuth = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, secret);
            req.user = decoded; // Gán user nếu token hợp lệ
        } catch (err) {
            // Token không hợp lệ, nhưng vẫn cho phép request đi tiếp.
            // Có thể log lỗi ở đây để debug nếu cần.
            console.warn("Invalid token for optionalAuth:", err.message);
            req.user = null; // Hoặc undefined, để đảm bảo req.user không chứa thông tin sai
        }
    } else {
        // Không có token, req.user sẽ vẫn là undefined
        req.user = null; // Gán rõ ràng là null nếu không có token
    }
    next(); // Luôn gọi next() để request đi tiếp
};
