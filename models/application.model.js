import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    cv: { type: mongoose.Schema.Types.ObjectId, ref: "CVProfile" },
    applicationDate: Date,
    status: String,
});

const Application = mongoose.model("Application", ApplicationSchema);

export default Application;
