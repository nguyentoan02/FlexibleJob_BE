import {
    requestNewPasswordReset,
    verifyNewPasswordResetToken,
    setNewPasswordWithToken,
} from "../service/forgotPassword.service.js";

export const requestNewReset = async (req, res) => {
    const { email } = req.body;
    const result = await requestNewPasswordReset(email);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const verifyNewResetToken = async (req, res) => {
    const { token } = req.params;
    const result = await verifyNewPasswordResetToken(token);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const setNewPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    console.log("Token:", token);
    console.log("Password:", password);

    const result = await setNewPasswordWithToken(token, password);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};
