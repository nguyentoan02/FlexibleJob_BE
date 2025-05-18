import mongoose from 'mongoose';
const CategorySchema = new mongoose.Schema({
  categoryName: String,
});

module.exports = mongoose.model('CompanyProfile', CompanyProfileSchema);

