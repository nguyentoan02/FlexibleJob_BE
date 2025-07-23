import { create, webHook, getTotalRevenue, getBuyersList } from "../service/payment.service.js";

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
        const webhookData = req.body;
        console.log("Received webhook:", JSON.stringify(webhookData, null, 2));

        // PHẢI AWAIT Ở ĐÂY
        // Chờ cho tất cả các thao tác trong service hoàn tất
        await webHook(webhookData);

        // Chỉ gửi response sau khi đã xử lý xong
        res.status(200).json({
            success: true,
            message: "Webhook processed successfully.",
        });
    } catch (error) {
        console.error("Webhook processing error:", error);
        // Trả về lỗi 500 để PayOS có thể thử lại nếu cần
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTotalRevenueController = async (req, res) => {
    try {
        const total = await getTotalRevenue();
        res.status(200).json(total);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBuyersListController = async (req, res) => {
    try {
        const buyers = await getBuyersList();
        res.status(200).json(buyers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
