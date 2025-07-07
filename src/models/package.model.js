import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema({
    packageName: String,
    description: String,
    price: Number,
});

const Package = mongoose.model("Package", PackageSchema);

export default Package;
