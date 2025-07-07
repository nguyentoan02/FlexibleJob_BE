import mongoose from "mongoose";

const ProgressBarSchema = new mongoose.Schema({
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
        required: true,
        unique: true, // 1 progress bar ứng với 1 ứng dụng
    },
    status: {
        type: String,
        enum: ["SEND", "CONSIDERING", "INTERVIEWING", "DONE"],
        required: true,
        default: "SEND",
    },
    currentStep: { type: Number, default: 0 },
    noted: { type: String },
    updatedAt: { type: Date, default: Date.now },
});

const ProgressBar = mongoose.model("ProgressBar", ProgressBarSchema);

export default ProgressBar;
