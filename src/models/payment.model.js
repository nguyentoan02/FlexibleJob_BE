import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package", // Gói đã mua
        required: true,
    },
    amount: {
        type: Number, // Số tiền thanh toán
        required: true,
    },
    paymentDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String, // Trạng thái thanh toán
        enum: ["SUCCESS", "FAILED", "PENDING"],
        default: "PENDING",
    },
    paymentMethod: {
        type: String,
        default: "PAYOS",
    },
    transactionId: {
        type: String, // ID giao dịch từ PayOS
    },
});

const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;
