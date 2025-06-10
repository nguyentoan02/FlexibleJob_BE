import jwt from "jsonwebtoken";
import { secret } from "../config/jwt.js";

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
