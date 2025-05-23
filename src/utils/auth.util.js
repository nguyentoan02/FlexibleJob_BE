import bcrypt from "bcryptjs";

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};
