import {
    getUserNotifications,
    markAllAsRead,
} from "../service/notification.service.js";

export const getMyNotificationsController = async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const result = await getUserNotifications(userId, page, limit);
    res.status(result.code).json(result);
};

export const markAllNotificationsAsReadController = async (req, res) => {
    const userId = req.user.id;
    const result = await markAllAsRead(userId);
    res.status(result.code).json(result);
};
