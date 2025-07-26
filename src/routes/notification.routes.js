import express from "express";
import auth from "../middlewares/auth.middleware.js";
import {
    getMyNotificationsController,
    markAllNotificationsAsReadController,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.use(auth);

// Lấy danh sách thông báo của người dùng đã đăng nhập
router.get("/", getMyNotificationsController);

// Đánh dấu tất cả thông báo là đã đọc
router.patch("/read-all", markAllNotificationsAsReadController);

export default router;
