import mongoose from 'mongoose';
const CVProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skills: [String],
  experience: String,
  description: String,
  education: String,
  certifications: String,
  linkUrl: String,
  number: String,
  avatar: String,
});

module.exports = mongoose.model('CvProfile', CVProfileSchema);
