import mongoose from "mongoose";

const limitJobsSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: "companyProfile" },
    posted: { type: Number, default: 0 },
    limit: { type: Number, default: 5 },
});

const LimitJobs = mongoose.model("limitJobs", limitJobsSchema);

export default LimitJobs;
