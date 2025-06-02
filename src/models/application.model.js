import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    cv: { type: mongoose.Schema.Types.ObjectId, ref: "CVProfile" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    applicationDate: { type: Date, default: Date.now },

    // Bỏ trạng thái ở đây, hoặc để làm trạng thái tổng quan (ví dụ "active", "withdrawn")
    // status: String,
    noted: { type: String },
    createdAt: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ["APPLIED", "REJECTED", "HIRED"],
        default: "APPLIED",
    },
    updatedAt: { type: Date, default: Date.now },
});

const Application = mongoose.model("Application", ApplicationSchema);

export default Application;
