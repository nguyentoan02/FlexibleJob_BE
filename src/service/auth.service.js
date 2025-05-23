import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { secret, expiresIn } from "../config/jwt.js";
import { generateToken, sendEmail } from "../utils/auth.util.js";
import Token from "../models/token.model.js";

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
            return dataResponse(400, "email already in use", null);
        }
        const user = new User({ email, password: hashedPassword, role });
        await user.save();
        return dataResponse(200, "create account successfully", user);
    } catch (err) {
        return dataResponse(500, `server error - message: ${err}`, null);
    }
};

export const loginAccount = async (email, password) => {
    const user = await User.findOne({ email: email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return dataResponse(401, "Invalid credentials", null);
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
