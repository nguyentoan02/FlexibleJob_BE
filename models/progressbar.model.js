import mongoose from "mongoose";    

const ProgressBarSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  status: {
    type: String,
    enum: ['SEND', 'CONSIDERING', 'INTERVIEWING', 'DONE'],
    required: true
  },
  currentStep: { type: Number, default: 0 },
  noted: { type: String }
});



export default mongoose.model("Like", LikeSchema);