import { create, webHook } from "../service/payment.service.js";

export const createPaymentLink = async (req, res) => {
    try {
        const { packageId } = req.body;
        console.log("body", packageId);
        const userId = req.user.id;
        const paymentLink = await create(userId, packageId);
        res.status(200).json(paymentLink);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const handleWebhook = async (req, res) => {
    try {
        // The body is already parsed by express.json()
        const webhookData = req.body;
        console.log("Received webhook:", JSON.stringify(webhookData, null, 2));

        // It's good practice to handle this asynchronously
        webHook(webhookData).catch((err) => {
            console.error("Error processing webhook:", err);
        });

        // Respond to PayOS immediately to prevent timeouts
        res.status(200).json({ success: true, message: "Webhook received" });
    } catch (error) {
        console.error("Webhook controller error:", error);
        res.status(400).json({ message: error.message });
    }
};
