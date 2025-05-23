import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { secret, expiresIn } from "../config/jwt.js";

const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    }();
};

export const createAccount = async (email, hashedPassword, role) => {
    try {
        const exists = User.exists({ email: email });
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
    const user = await User.findOne({ email });

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
