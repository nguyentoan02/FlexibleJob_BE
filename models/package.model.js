import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema({
  packageName: String,
  description: String,
  price: Number,
});

export default mongoose.model("Package", PackageSchema);