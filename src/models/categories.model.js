import mongoose from "mongoose";
const CategorySchema = new mongoose.Schema({
    categoryName: String,
});

const Category = mongoose.model("Categories", CategorySchema);

export default Category;
