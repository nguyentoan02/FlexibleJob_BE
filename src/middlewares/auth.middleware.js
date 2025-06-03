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
