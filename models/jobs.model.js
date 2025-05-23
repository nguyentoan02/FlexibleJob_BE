import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyProfile" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    title: String,
    description: String,
    experienceYears: Number,
    location: String,
    salary: Number,
    status: String,
    date: Date,
});

const Job = mongoose.model("Job", JobSchema);

export default Job;
