import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    participants: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            role: {
                type: String,
                enum: ["EMPLOYER", "JOBSEEKER"],
                required: true,
            },
        },
    ],
    jobseeker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompanyProfile",
        required: true,
    },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    lastActivity: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Index để tìm kiếm nhanh
ChatSchema.index({ jobseeker: 1, employer: 1 }, { unique: true });
ChatSchema.index({ company: 1 });
ChatSchema.index({ lastActivity: -1 });

const Chat = mongoose.model("Chat", ChatSchema);
export default Chat;
