import mongoose from "mongoose";

const FollowCompanySchema = new mongoose.Schema({
    Company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const FollowCompany = mongoose.model("FollowCompany", FollowCompanySchema);

export default FollowCompany;
