import mongoose from 'mongoose';

const CompanyProfileSchema = new mongoose.Schema({
  companyName: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  aboutUs: String,
  address: String,
  status: boolean,
  imageUrl: String,
  identityImage: String,
});

module.exports = mongoose.model('CompanyProfile', CompanyProfileSchema);
