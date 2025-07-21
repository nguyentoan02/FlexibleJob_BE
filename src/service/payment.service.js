import payos from "../config/payos.js";
import Package from "../models/package.model.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import LimitJobs from "../models/limitJobs.model.js"; // Thêm dòng này

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

    const payment = await Payment.findOne({ orderCode: data.orderCode });
    if (!payment) {
        throw new Error("Payment record not found");
    }

    if (data.code === "00") {
        payment.status = "SUCCESS";
        payment.transactionId = data.paymentId;

        const user = await User.findById(payment.userId);
        const pkg = await Package.findById(payment.packageId);

        if (user && pkg) {
            user.package = {
                packageId: pkg._id,
                purchaseDate: new Date(),
                expiryDate: new Date(
                    new Date().setDate(
                        new Date().getDate() + (pkg.durationInDays || 30)
                    )
                ),
            };
            await user.save();

            // Cộng job cho LimitJobs theo từng loại package
            let addJobs = 0;
            if (pkg.name === "Ultimate") addJobs = 10;
            else if (pkg.name === "Business") addJobs = 11;
            else if (pkg.name === "Basic") addJobs = 12;

            // Đảm bảo user có companyProfile
            const companyId = user.companyProfile;
            if (companyId) {
                let limitJobs = await LimitJobs.findOne({ company: companyId });
                if (!limitJobs) {
                    limitJobs = new LimitJobs({
                        company: companyId,
                        posted: 0,
                        limit: addJobs,
                    });
                    await limitJobs.save();
                } else {
                    limitJobs.limit = (limitJobs.limit || 0) + addJobs;
                    await limitJobs.save();
                }
            }
        }
    } else {
        payment.status = "FAILED";
    }

    await payment.save();
    return { success: true };
};
