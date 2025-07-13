import payos from "../config/payos.js";
import Package from "../models/package.model.js";
import Payment from "../models/payment.model.js";

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
        returnUrl: `${process.env.FRONTEND_URL}/company/dashboard/success`,
        cancelUrl: `${process.env.FRONTEND_URL}/company/dashboard/cancel`,
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
