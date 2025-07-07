import mongoose from "mongoose";

const PasswordResetTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User", // Refers to your User model
    },
    token: {
        type: String,
        required: true,
        unique: true, // Ensure tokens are unique
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600, // Token expires in 1 hour (3600 seconds)
    },
});

const PasswordResetToken = mongoose.model(
    "PasswordResetToken",
    PasswordResetTokenSchema
);

export default PasswordResetToken;
