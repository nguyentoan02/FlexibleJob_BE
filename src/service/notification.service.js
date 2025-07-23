import Notification from "../models/notification.model.js";

const dataResponse = (code, message, payload) => ({ code, message, payload });

/**
 * Hàm chung để tạo thông báo.
 * @param {string} userId - ID của người nhận.
 * @param {string} message - Nội dung thông báo.
 * @param {'APPLICATION_SUBMITTED' | 'APPLICATION_SUCCESS' | 'APPLICATION_STATUS_CHANGED' | 'JOB_HIDDEN' | 'SYSTEM'} type - Loại thông báo.
 * @param {string} [link] - (Tùy chọn) URL để điều hướng.
 */
export const createNotification = async (userId, message, type, link) => {
    try {
        if (!userId || !message || !type) {
            console.error(
                "Notification creation failed: Missing required fields."
            );
            return;
        }
        const notification = new Notification({
            user: userId,
            message,
            type,
            link,
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error(`Error creating notification: ${error.message}`);
    }
};

export const getUserNotifications = async (userId, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Notification.countDocuments({ user: userId });
        const unreadCount = await Notification.countDocuments({
            user: userId,
            readStatus: false,
        });

        return dataResponse(200, "Notifications fetched successfully", {
            notifications,
            total,
            unreadCount,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

export const markAllAsRead = async (userId) => {
    try {
        await Notification.updateMany(
            { user: userId, readStatus: false },
            { $set: { readStatus: true } }
        );
        return dataResponse(200, "All notifications marked as read.", null);
    } catch (error) {
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};
