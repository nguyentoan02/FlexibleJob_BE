import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
        // validate: {
        //   validator: function (v) {
        //     return /@/.test(v);
        //   },
        //   message: props => 'Email must contain @ symbol'
        // }
    },
    password: {
        type: String,
        // validate: {
        //   validator: function (v) {
        //     return /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(.{6,})$/.test(v);
        //   },
        //   message: props => 'Password must be at least 6 characters'
        // }
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
});

const User = mongoose.model("User", UserSchema);
export default User;
