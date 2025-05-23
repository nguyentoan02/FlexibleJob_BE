import mongoose from "mongoose";
const CVProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    skills: [String],
    experience: String,
    description: String,
    education: String,
    certifications: String,
    linkUrl: String,
    number: String,
    avatar: String,
});

const CvProfile = mongoose.model("CvProfile", CVProfileSchema);

export default CvProfile;
