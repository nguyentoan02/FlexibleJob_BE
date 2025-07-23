import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now, expires: 300 }, // TTL 5 phút
    type: { type: String, required: true },
    tempData: { type: Object },
});

// Đảm bảo index TTL được tạo
tokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const Token = mongoose.model("Token", tokenSchema);

export default Token;
