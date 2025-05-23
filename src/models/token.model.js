import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createAt: {
        type: Date,
        default: Date.now(),
        expires: "1d",
    },
    type: {
        type: String,
        require: true,
    },
});

const Token = mongoose.model("Token", tokenSchema);

export default Token;
