import { hashPassword } from "../utils/auth.util.js";
import { createAccount, loginAccount } from "../service/auth.service.js";

export const register = async (req, res) => {
    const { email, password, role } = req.body;

    const hashedPassword = hashPassword(password);

    const result = await createAccount(email, hashedPassword, role);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const result = await loginAccount(email, password);

    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const logout = (req, res) => {
    res.json({ message: "Logged out successfully" });
};
