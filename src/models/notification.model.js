import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: String,
    time: Date,
    readStatus: Boolean,
});
const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;
