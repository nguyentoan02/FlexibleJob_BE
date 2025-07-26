import mongoose from "mongoose";

const FollowCompanySchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompanyProfile",
        required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    followedAt: { type: Date, default: Date.now },
});

FollowCompanySchema.index({ company: 1, user: 1 }, { unique: true }); // tránh follow trùng

const FollowCompany = mongoose.model("FollowCompany", FollowCompanySchema);

export default FollowCompany;
