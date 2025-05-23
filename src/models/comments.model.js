import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog" },
    commentText: String,
    commentDate: Date,
    status: String,
});
const Comment = mongoose.model("Comment", CommentSchema);

export default Comment;
