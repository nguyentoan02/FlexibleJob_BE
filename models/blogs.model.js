import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  content: String,
  publishDate: Date,
  image: String,
  status: String,
});
export default mongoose.model("Blog", BlogSchema);
