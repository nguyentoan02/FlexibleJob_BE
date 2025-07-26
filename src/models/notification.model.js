import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: [
            "APPLICATION_SUBMITTED",
            "APPLICATION_SUCCESS",
            "APPLICATION_STATUS_CHANGED",
            "JOB_HIDDEN",
            "SYSTEM",
        ],
        required: true,
    },
    link: {
        type: String, // Link để điều hướng khi người dùng nhấp vào, ví dụ: /jobseeker/applications
    },
    readStatus: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

NotificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;
