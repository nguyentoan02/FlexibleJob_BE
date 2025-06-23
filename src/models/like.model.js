import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog" },
});
const Like = mongoose.model("Like", LikeSchema);
//test
export default Like;
