import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompanyProfile",
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories",
        required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true }, // Mô tả chi tiết công việc
    requirements: [String], // Các yêu cầu bắt buộc
    benefits: [String], // Quyền lợi (bảo hiểm, phụ cấp, ...)

    experienceYears: { type: Number, default: 0 }, // Số năm kinh nghiệm yêu cầu
    level: {
        type: String,
        enum: ["Intern", "Fresher", "Junior", "Mid", "Senior", "Manager"],
        default: "Junior",
    },
    jobType: {
        type: String,
        enum: ["Full-time", "Part-time", "Internship", "Contract", "Remote"],
        default: "Full-time",
    },
    location: { type: String },
    isRemote: { type: Boolean, default: false },

    salary: {
        min: { type: Number },
        max: { type: Number },
        currency: { type: String, default: "USD" }, // hoặc 'VND'
    },

    datePosted: { type: Date, default: Date.now },
    deadline: { type: Date }, // Hạn chót nộp đơn

    views: { type: Number, default: 0 }, // Thống kê lượt xem
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }], // Ứng viên đã nộp

    expiredAt: { type: Date }, // NEW: ngày hết hạn
    isExpired: { type: Boolean, default: false }, // NEW: đánh dấu thủ công/tự động

    // Nếu muốn tracking kỹ:
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Job = mongoose.model("Job", JobSchema);

export default Job;
