import mongoose from "mongoose";
const CategorySchema = new mongoose.Schema({
    categoryName: String,
});

const Category = mongoose.model("CompanyProfile", CompanyProfileSchema);

export default Category;
