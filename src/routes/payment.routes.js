import auth from "../middlewares/auth.middleware.js";
import express from "express";
import {
    createPaymentLink,
    handleWebhook,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-payment-link", auth, createPaymentLink);

// Handle PayOS webhook - no authentication needed
router.post("/webhook", handleWebhook);

export default router;
