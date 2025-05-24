import mongoose from "mongoose";

const CompanyProfileSchema = new mongoose.Schema({
    companyName: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    aboutUs: String,
    address: String,
    status: Boolean,
    imageUrl: String,
    identityImage: String,
});

const CompanyProfile = mongoose.model("CompanyProfile", CompanyProfileSchema);

export default CompanyProfile;
