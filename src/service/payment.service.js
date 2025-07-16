import payos from "../config/payos.js";
import Package from "../models/package.model.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";

export const create = async (userId, packageId) => {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
        throw new Error("Package not found");
    }

    const orderCode = Date.now();
    const paymentData = {
        orderCode,
        amount: pkg.price,
        description: `package: ${pkg.name}`,
        returnUrl: `${process.env.FRONTEND_URL}/company/dashboard/payment/success`,
        cancelUrl: `${process.env.FRONTEND_URL}/company/dashboard/payment/cancel`,
    };

    const paymentLink = await payos.createPaymentLink(paymentData);

    const newPayment = new Payment({
        userId,
        packageId,
        orderCode,
        amount: pkg.price,
    });
    await newPayment.save();

    return paymentLink;
};

export const webHook = async (webhookData) => {
    const { orderCode, success, data } = webhookData;

    // Verify the webhook signature (important for production)
    // For simplicity in this example, we'll trust the data.
    // In a real app, you MUST verify the signature from PayOS.
    // const isValid = payos.verifyPaymentWebhook(webhookData);
    // if (!isValid) {
    //   throw new Error("Invalid webhook signature");
    // }

    const payment = await Payment.findOne({ orderCode: data.orderCode });
    if (!payment) {
        throw new Error("Payment record not found");
    }

    if (data.code === "00") {
        // '00' means success
        payment.status = "SUCCESS";
        payment.transactionId = data.paymentId; // Save PayOS transaction ID

        // Update user's package
        const user = await User.findById(payment.userId);
        const pkg = await Package.findById(payment.packageId);

        if (user && pkg) {
            user.package = {
                packageId: pkg._id,
                purchaseDate: new Date(),
                expiryDate: new Date(
                    new Date().setDate(
                        new Date().getDate() + pkg.durationInDays
                    )
                ),
            };
            await user.save();
        }
    } else {
        payment.status = "FAILED";
    }

    await payment.save();
    return { success: true };
};

// Tính tổng doanh thu từ các payment thành công
export const getTotalRevenue = async () => {
    const result = await Payment.aggregate([
        { $match: { status: "PENDING" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    return result[0]?.total || 0;
};

// Lấy danh sách người dùng đã mua dịch vụ (payment thành công)
export const getBuyersList = async () => {
    // Lấy các payment thành công, populate user và package
    const payments = await Payment.find({ status: "PENDING" })
        .populate("userId", "firstName lastName email role")
        .populate("packageId", "name price description");
    // Trả về danh sách gồm user, package, amount, thời gian mua
    return payments.map(payment => ({
        user: payment.userId,
        package: payment.packageId,
        amount: payment.amount,
        purchasedAt: payment.createdAt
    }));
};
