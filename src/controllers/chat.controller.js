import {
    createOrGetChat,
    createChatWithCompany,
    searchEmployers,
    getAllEmployers,
    getUserChats,
    getChatMessages,
    markMessagesAsRead,
    deleteChat,
    searchChats,
    sendMessage, // Thêm import này
} from "../service/chat.service.js";

const handleResponse = (res, serviceResponse) => {
    return res.status(serviceResponse.code).json(serviceResponse);
};

export const createChatController = async (req, res) => {
    try {
        const { jobseekerId, employerId } = req.body;

        if (!jobseekerId || !employerId) {
            return res.status(400).json({
                code: 400,
                message: "Both jobseekerId and employerId are required",
                payload: null,
            });
        }

        const result = await createOrGetChat(jobseekerId, employerId);
        handleResponse(res, result);
    } catch (error) {
        console.error("Error in createChatController:", error);
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            payload: null,
        });
    }
};

export const createChatWithCompanyController = async (req, res) => {
    try {
        const { companyId } = req.body;
        const jobseekerId = req.user.id;

        if (!companyId) {
            return res.status(400).json({
                code: 400,
                message: "Company ID is required",
                payload: null,
            });
        }

        const result = await createChatWithCompany(jobseekerId, companyId);
        handleResponse(res, result);
    } catch (error) {
        console.error("Error in createChatWithCompanyController:", error);
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            payload: null,
        });
    }
};

export const searchEmployersController = async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;

        if (!search) {
            return res.status(400).json({
                code: 400,
                message: "Search term is required",
                payload: null,
            });
        }

        const result = await searchEmployers(
            search,
            parseInt(page),
            parseInt(limit)
        );
        handleResponse(res, result);
    } catch (error) {
        console.error("Error in searchEmployersController:", error);
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            payload: null,
        });
    }
};

export const getAllEmployersController = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const result = await getAllEmployers(parseInt(page), parseInt(limit));
        handleResponse(res, result);
    } catch (error) {
        console.error("Error in getAllEmployersController:", error);
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            payload: null,
        });
    }
};

export const getUserChatsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;

        const result = await getUserChats(
            userId,
            parseInt(page),
            parseInt(limit)
        );
        handleResponse(res, result);
    } catch (error) {
        console.error("Error in getUserChatsController:", error);
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            payload: null,
        });
    }
};

export const getChatMessagesController = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;
        const { page = 1, limit = 50 } = req.query;

        const result = await getChatMessages(
            chatId,
            userId,
            parseInt(page),
            parseInt(limit)
        );
        handleResponse(res, result);
    } catch (error) {
        console.error("Error in getChatMessagesController:", error);
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            payload: null,
        });
    }
};

export const markAsReadController = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        const result = await markMessagesAsRead(chatId, userId);
        handleResponse(res, result);
    } catch (error) {
        console.error("Error in markAsReadController:", error);
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            payload: null,
        });
    }
};

export const deleteChatController = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        const result = await deleteChat(chatId, userId);
        handleResponse(res, result);
    } catch (error) {
        console.error("Error in deleteChatController:", error);
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            payload: null,
        });
    }
};

export const searchChatsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { search } = req.query;

        if (!search) {
            return res.status(400).json({
                code: 400,
                message: "Search term is required",
                payload: null,
            });
        }

        const result = await searchChats(userId, search);
        handleResponse(res, result);
    } catch (error) {
        console.error("Error in searchChatsController:", error);
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            payload: null,
        });
    }
};

export const sendMessageController = async (req, res) => {
    try {
        console.log("=== SEND MESSAGE CONTROLLER ===");
        console.log("Request params:", req.params);
        console.log("Request body:", req.body);
        console.log("User ID:", req.user.id);
        console.log("User role:", req.user.role);

        const { chatId } = req.params;
        const { content, messageType = "text", fileUrl, fileName } = req.body;
        const senderId = req.user.id;

        if (!content || content.trim() === "") {
            console.log("❌ Empty content");
            return res.status(400).json({
                code: 400,
                message: "Message content is required",
                payload: null,
            });
        }

        console.log("Calling sendMessage service...");
        const result = await sendMessage(chatId, senderId, {
            content: content.trim(),
            messageType,
            fileUrl,
            fileName,
        });

        console.log("✅ Service result:", result);
        handleResponse(res, result);
    } catch (error) {
        console.error("❌ Error in sendMessageController:", error);
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            payload: null,
        });
    }
};
