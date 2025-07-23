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
        console.error(
            "Webhook Error: Payment record not found for orderCode:",
            data.orderCode
        );
        throw new Error("Payment record not found");
    }

    if (data.code === "00") {
        payment.status = "SUCCESS";
        payment.transactionId = data.paymentId;

        const user = await User.findById(payment.userId);
        const pkg = await Package.findById(payment.packageId);

        console.log(
            "Webhook - User found:",
            user ? user._id.toString() : "Not Found"
        );
        console.log("Webhook - Package found:", pkg ? pkg.name : "Not Found");

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

            let addJobs = 0;
            if (pkg.name === "Ultimate") addJobs = 10;
            else if (pkg.name === "Business") addJobs = 11;
            else if (pkg.name === "Basic") addJobs = 12;

            console.log(
                `Webhook - Package: ${pkg.name}, Jobs to add: ${addJobs}`
            );

            const companyId = user.companyProfile;
            console.log("Webhook - CompanyProfile ID from user:", companyId);

            if (companyId) {
                let limitJobs = await LimitJobs.findOne({ company: companyId });
                console.log(
                    "Webhook - Found LimitJobs before update:",
                    limitJobs
                );

                if (!limitJobs) {
                    console.log(
                        "Webhook - No LimitJobs found, creating new one."
                    );
                    limitJobs = new LimitJobs({
                        company: companyId,
                        posted: 0,
                        limit: addJobs,
                    });
                    await limitJobs.save();
                    console.log("Webhook - New LimitJobs created:", limitJobs);
                } else {
                    console.log(
                        `Webhook - Updating existing LimitJobs. Current limit: ${limitJobs.limit}`
                    );
                    limitJobs.limit = (limitJobs.limit || 0) + addJobs;
                    await limitJobs.save();
                    console.log("Webhook - LimitJobs after update:", limitJobs);
                }
            } else {
                console.error(
                    "Webhook - CRITICAL: user.companyProfile is missing. Cannot add jobs."
                );
            }
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
