import mongoose from "mongoose";

const CompanyProfileSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    aboutUs: { type: String },
    address: { type: String },
    location: { type: String }, // ví dụ: Hà Nội, TP.HCM, Đà Nẵng

    // NEW: Lĩnh vực hoạt động
    industry: { type: String }, // ví dụ: "IT", "Finance", "Education"...

    // NEW: Quy mô công ty
    companySize: {
        type: String,
        enum: ["1-9", "10-49", "50-199", "200-499", "500-999", "1000+"],
    },

    website: { type: String },

    email: { type: String },
    phone: { type: String },

    // NEW: Các mạng xã hội / branding
    linkedinUrl: { type: String },
    facebookUrl: { type: String },

    imageUrl: { type: String }, // Ảnh đại diện
    coverImage: { type: String }, // Ảnh nền nếu cần (giống LinkedIn)
    identityImage: { type: String }, // Ảnh xác thực (giấy phép KD, logo...)

    // Duyệt hồ sơ
    isApproved: { type: Boolean, default: false },

    // Trạng thái hoạt động (có thể ẩn công ty)
    status: { type: Boolean, default: true },

    createdAt: { type: Date, default: Date.now },
});

const CompanyProfile = mongoose.model("CompanyProfile", CompanyProfileSchema);

export default CompanyProfile;
