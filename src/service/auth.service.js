import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { secret, expiresIn } from "../config/jwt.js";
import { generateToken, hashPassword, sendEmail } from "../utils/auth.util.js";
import Token from "../models/token.model.js";
import CompanyProfile from "../models/companyprofile.model.js";
import LimitJobs from "../models/limitJobs.model.js";

const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

export const createAccount = async (email, hashedPassword, role) => {
    try {
        const exists = await User.exists({ email: email });
        if (exists) {
            return dataResponse(
                400,
                "Email đã được đăng ký bởi người dùng khác.",
                null
            );
        }

        const verifyToken = generateToken();
        await Token.create({
            token: verifyToken,
            type: "verifyEmail",
            tempData: { email, password: hashedPassword, role },
        });

        // Thêm timeout cho gửi mail
        let sendResult;
        try {
            sendResult = await Promise.race([
                sendEmail(
                    email,
                    "Xác nhận đăng ký tài khoản",
                    `Vui lòng xác nhận email của bạn bằng cách nhấn vào link sau: ${process.env.FRONTEND_URL}/verify-email/${verifyToken}`
                ),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout")), 6000)
                ),
            ]);
        } catch (err) {
            // Nếu gửi mail lỗi hoặc timeout
            await Token.deleteOne({ token: verifyToken, type: "verifyEmail" });
            return dataResponse(
                500,
                "Gửi email xác nhận thất bại, vui lòng thử lại sau.",
                null
            );
        }

        return dataResponse(
            200,
            "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản (hạn 5 phút).",
            null
        );
    } catch (err) {
        return dataResponse(500, `server error - message: ${err}`, null);
    }
};

export const loginAccount = async (email, password) => {
    const user = await User.findOne({ email: email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return dataResponse(401, "Invalid credentials", null);
    }

    // Check if user is banned
    if (user.isBanned) {
        return dataResponse(
            403,
            "Your account has been banned. Please contact administrator for more information.",
            null
        );
    }

    const token = jwt.sign(
        { id: user._id, role: user.role, username: user.email },
        secret,
        { expiresIn }
    );

    const decoded = jwt.decode(token);
    console.log(decoded);

    return dataResponse(200, "login successfully", token);
};

export const resetPasswordViaEmail = async (email) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        return dataResponse(404, "can not find this user", null);
    }
    const resetToken = generateToken();
    const createToken = await Token.create({
        token: resetToken,
        userId: user._id,
        type: "resetPassword",
    });
    if (createToken) {
        const sendToken = await sendEmail(
            email,
            "Reset Your password",
            `http://localhost:5173/resetPassword/${resetToken}`
        );
        return sendToken;
    } else {
        return dataResponse(500, "server error", null);
    }
};

export const newPassword1 = async (token, email1, password) => {
    const hashedPassword = await hashPassword(password);

    const updatedUser = await User.findOneAndUpdate(
        { email: email1 },
        { password: hashedPassword },
        { new: true }
    );
    if (updatedUser) {
        await Token.findOneAndUpdate({ token: token });
        return dataResponse(200, "reset password successfully", updatedUser);
    }
    return dataResponse(404, "User not found", null);
};

export const verifyResetToken = async (token) => {
    const token1 = await Token.findOne({ token: token }).populate({
        path: "userId",
        select: "email -_id",
    });
    if (token1.type === "resetPassword") {
        return dataResponse(200, "valid token", token1);
    }
    return dataResponse(400, "invalid token", null);
};

export const verifyEmail = async (token) => {
    const tokenDoc = await Token.findOne({ token, type: "verifyEmail" });
    let emailToSend = null;
    let sendResult = null;

    if (!tokenDoc) {
        return dataResponse(
            400,
            "Token xác thực không hợp lệ hoặc đã hết hạn.",
            null
        );
    }

    // Check if the token has expired
    if (tokenDoc.createdAt < new Date(Date.now() - 5 * 60 * 1000)) {
        // 5 phút
        return dataResponse(400, "Token xác thực đã hết hạn.", null);
    }

    // Nếu đã có userId thì không cho xác thực lại
    if (tokenDoc.userId) {
        emailToSend = tokenDoc.tempData?.email;
        if (emailToSend) {
            await sendEmail(
                emailToSend,
                "Đăng ký thất bại",
                "Token xác thực đã được sử dụng. Vui lòng đăng ký lại."
            );
        }
        return dataResponse(400, "Token đã được sử dụng.", null);
    }

    // Lấy thông tin đăng ký tạm thời
    const { email, password, role } = tokenDoc.tempData || {};
    if (!email || !password || !role) {
        return dataResponse(400, "Thiếu thông tin đăng ký.", null);
    }

    // Kiểm tra lại email có bị đăng ký bởi người khác chưa
    const exists = await User.exists({ email });
    if (exists) {
        await sendEmail(
            email,
            "Đăng ký thất bại",
            "Email đã được đăng ký bởi người dùng khác. Vui lòng thử lại với email khác."
        );
        await Token.deleteOne({ _id: tokenDoc._id });
        return dataResponse(
            400,
            "Email đã được đăng ký bởi người dùng khác.",
            null
        );
    }

    // Tạo user thật sự
    const user = new User({
        email,
        password,
        role,
        isBanned: false,
        isVerified: true,
    });
    await user.save();

    // Nếu là EMPLOYER thì tạo CompanyProfile và LimitJobs
    let companyProfile = null;
    let jobLimit = null;
    if (role === "EMPLOYER") {
        companyProfile = new CompanyProfile({ user: user._id });
        await companyProfile.save();
        jobLimit = new LimitJobs({ company: companyProfile._id });
        await jobLimit.save();

        // Gán companyProfile vào user nếu cần
        user.companyProfile = companyProfile._id;
        await user.save();
    }

    // Gán userId vào token (để đánh dấu đã xác thực)
    tokenDoc.userId = user._id;
    await tokenDoc.save();

    await Token.deleteOne({ _id: tokenDoc._id }); // Xóa token sau khi xác thực

    // Gửi mail đăng ký thành công, kèm link đăng nhập
    await sendEmail(
        email,
        "Đăng ký thành công",
        `Chúc mừng bạn đã đăng ký thành công! Bạn có thể đăng nhập tại đây: ${process.env.FRONTEND_URL}/login`
    );

    return dataResponse(
        200,
        "Xác thực email thành công. Tài khoản đã được tạo.",
        {
            user,
            companyProfile,
            jobLimit,
        }
    );
};
