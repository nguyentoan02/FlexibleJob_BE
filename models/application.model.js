import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  cv: { type: mongoose.Schema.Types.ObjectId, ref: 'CVProfile' },
  applicationDate: Date,
  status: String,
});

module.exports = mongoose.model('Application', ApplicationSchema);