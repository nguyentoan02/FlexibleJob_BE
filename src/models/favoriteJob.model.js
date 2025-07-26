import mongoose from "mongoose";

const FavoriteJobSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create compound index to prevent duplicate favorites
FavoriteJobSchema.index({ user: 1, job: 1 }, { unique: true });

const FavoriteJob = mongoose.model("FavoriteJob", FavoriteJobSchema);

export default FavoriteJob;
