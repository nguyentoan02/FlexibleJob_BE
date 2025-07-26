import Category from "../models/categories.model.js";

const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

export const allCategory = async () => {
    const result = await Category.find();
    return dataResponse(200, "success", result);
};

export const createNewCategory = async (categoyName) => {
    try {
        const category = Category.create({
            categoryName: categoyName,
        });
        return dataResponse(201, "category created success", category);
    } catch (error) {
        return dataResponse(500, error.message, null);
    }
};
