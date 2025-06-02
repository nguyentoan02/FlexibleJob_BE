// src/models/user.model.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
        required: true, // Thêm required cho email
        // validate: {
        //   validator: function (v) {
        //     return /@/.test(v);
        //   },
        //   message: props => 'Email must contain @ symbol'
        // }
    },
    password: {
        type: String,
        // Không bắt buộc nếu người dùng đăng nhập bằng Google
        // validate: {
        //   validator: function (v) {
        //     return /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(.{6,})$/.test(v);
        //   },
        //   message: props => 'Password must be at least 6 characters'
        // }
    },
    googleId: {
        // NEW: Thêm trường Google ID
        type: String,
        unique: true,
        sparse: true, // Cho phép nhiều tài liệu có giá trị null
    },
    cvProfile: { type: mongoose.Schema.Types.ObjectId, ref: "CVProfile" },
    companyProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompanyProfile",
    },
    packages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Package" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    role: {
        type: String,
        enum: ["ADMIN", "JOBSEEKER", "EMPLOYER"],
        default: "JOBSEEKER",
    },
    imageUrl: String,
    isBanned: {
        type: Boolean,
        default: false,
    },
});

// Điều chỉnh validate cho password: chỉ yêu cầu nếu không có googleId
UserSchema.pre("save", function (next) {
    if (!this.password && !this.googleId) {
        const error = new Error("Password or Google ID is required.");
        next(error);
    } else {
        next();
    }
});

const User = mongoose.model("User", UserSchema);
export default User;
