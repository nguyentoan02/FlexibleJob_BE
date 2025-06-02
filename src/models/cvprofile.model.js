import mongoose from "mongoose";
const CVProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    skills: [String],
    education: [
        {
            school: String,
            degree: String,
            fieldOfStudy: String,
            startDate: Date,
            endDate: Date,
            description: String,
        },
    ],
    experience: [
        {
            company: String,
            position: String,
            startDate: Date,
            endDate: Date,
            description: String,
            location: String,
        },
    ],

    description: String,

    certifications: String,
    linkUrl: String,
    number: String,
    avatar: String,
});

const CvProfile = mongoose.model("CvProfile", CVProfileSchema);

export default CvProfile;
