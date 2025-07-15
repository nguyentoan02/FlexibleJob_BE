import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: String,
    time: Date,
    readStatus: Boolean,
});

import mongoose from "mongoose";

// const NotificationSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true, // Người nhận thông báo
//   },
//   message: {
//     type: String,
//     required: true, // Nội dung hiển thị ngắn gọn
//   },
//   type: {
//     type: String,
//     enum: [
//       "NEW_JOB",           // Công ty đăng job mới
//       "APPLICATION_UPDATE",// Trạng thái ứng tuyển thay đổi
//       "COMMENT",           // Ai đó bình luận vào bài viết
//       "FOLLOWED_COMPANY_JOB", // Công ty bạn theo dõi vừa đăng bài
//       "SYSTEM",            // Thông báo hệ thống chung
//       "PROFILE_APPROVED",  // Admin duyệt hồ sơ công ty
//       "REMINDER",          // Nhắc nhở (nộp CV, cập nhật profile,...)
//     ],
//     default: "SYSTEM",
//   },
//   readStatus: {
//     type: Boolean,
//     default: false,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },

//   // Dữ liệu liên quan (nếu có)
//   relatedJob: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Job",
//   },
//   relatedCompany: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "CompanyProfile",
//   },
//   relatedApplication: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Application",
//   },
//   relatedComment: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Comment",
//   },
// });

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;
