import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    content: String,
    publishDate: Date,
    image: String,
    status: String,
});

const Blog = mongoose.model("Blog", BlogSchema);

export default Blog;
