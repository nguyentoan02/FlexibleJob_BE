import auth from "../middlewares/auth.middleware.js";
import express from "express";
import {
    createPaymentLink,
    handleWebhook,
    getTotalRevenueController,
    getBuyersListController,
} from "../controllers/payment.controller.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/create-payment-link", auth, createPaymentLink);

// Handle PayOS webhook - no authentication needed
router.post("/webhook", handleWebhook);

// Route lấy tổng doanh thu (chỉ ADMIN)
router.get("/revenue", auth, checkRole(["ADMIN"]), getTotalRevenueController);
// Route lấy danh sách người mua dịch vụ (chỉ ADMIN)
router.get("/buyers", auth, checkRole(["ADMIN"]), getBuyersListController);

export default router;
