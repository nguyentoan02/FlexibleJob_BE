import express from "express";
import auth, { isRole } from "../middlewares/auth.middleware.js";
import {
    createChatController,
    createChatWithCompanyController,
    searchEmployersController,
    getAllEmployersController,
    getUserChatsController,
    getChatMessagesController,
    sendMessageController, // Thêm dòng này
    markAsReadController,
    deleteChatController,
    searchChatsController,
} from "../controllers/chat.controller.js";

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(auth);

// Tạo hoặc lấy chat giữa jobseeker và employer (dùng ID)
router.post("/create", createChatController);

// Tạo chat với company (dành cho JOBSEEKER)
router.post(
    "/create-with-company",
    isRole("JOBSEEKER"),
    createChatWithCompanyController
);

// Tìm kiếm employers/companies (dành cho JOBSEEKER)
router.get("/search-employers", isRole("JOBSEEKER"), searchEmployersController);

// Lấy tất cả employers/companies (dành cho JOBSEEKER)
router.get("/employers", getAllEmployersController);

// Lấy danh sách chats của user
router.get("/", getUserChatsController);

// Tìm kiếm chats
router.get("/search", searchChatsController);

// Lấy messages của một chat
router.get("/:chatId/messages", getChatMessagesController);

// GỬI TIN NHẮN - Thêm endpoint này
router.post("/:chatId/messages", sendMessageController);

// Đánh dấu messages đã đọc
router.patch("/:chatId/read", markAsReadController);

// Xóa chat
router.delete("/:chatId", deleteChatController);

export default router;
