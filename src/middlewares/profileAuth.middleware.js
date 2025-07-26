import jwt from "jsonwebtoken";

export const profileAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res
            .status(401)
            .json({ message: "Unauthorized: Token missing in profileAuth" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user.id = decoded.id;
        req.user.role = decoded.role;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token in profileAuth" });
    }
};

// Middleware kiểm tra quyền truy cập cho profile
export const checkProfileOwnerOrAdmin = () => {
    return (req, res, next) => {
        // req.user.id và req.user.role đã được thiết lập bởi profileAuth middleware
        const authenticatedUserId = req.user.id; // ID của người dùng đã xác thực
        const targetUserId = req.params.userId; // ID của người dùng trong URL

        // Cho phép ADMIN truy cập bất kỳ profile nào, hoặc nếu người dùng đang truy cập profile của chính họ
        if (req.user.role === "ADMIN" || authenticatedUserId === targetUserId) {
            next(); // Nếu có quyền, cho phép yêu cầu tiếp tục
        } else {
            // Nếu không có quyền, trả về lỗi 403 Forbidden
            return res.status(403).json({
                message:
                    "Access denied: You can only view/update your own profile",
            });
        }
    };
};
