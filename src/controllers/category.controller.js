import { allCategory, insertCategory } from "../service/category.service.js";

export const getAllCategory = async (req, res) => {
    const result = await allCategory();
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const createCategory = async (req, res) => {
    const { categoryName } = req.body;
    const result = await insertCategory(categoryName);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};
