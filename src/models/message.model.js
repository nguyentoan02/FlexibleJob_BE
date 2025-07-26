import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false, // Cho phép null cho system message
    },
    content: { type: String, required: true },
    messageType: {
        type: String,
        enum: ["text", "file", "image", "system"],
        default: "text",
    },
    fileUrl: { type: String },
    fileName: { type: String },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

// Index để truy vấn nhanh
MessageSchema.index({ chat: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });

const Message = mongoose.model("Message", MessageSchema);
export default Message;
