import { createOrGetChat } from "./chat.service.js";
import socketService from "./socket.service.js";

export const initiateChatFromApplication = async (application) => {
    try {
        // Populate thông tin cần thiết
        await application.populate([
            { path: "user", select: "firstName lastName" },
            {
                path: "job",
                populate: {
                    path: "company",
                    populate: {
                        path: "user",
                        select: "_id",
                    },
                },
            },
        ]);

        const jobseekerId = application.user._id.toString();
        const employerId = application.job.company.user._id.toString();

        // Tạo hoặc lấy chat
        const chatResult = await createOrGetChat(jobseekerId, employerId);

        if (chatResult.code === 200) {
            // Gửi tin nhắn hệ thống chào mừng
            await socketService.sendSystemMessage(
                chatResult.payload._id,
                `Chào mừng! ${application.user.firstName} ${application.user.lastName} đã ứng tuyển vào vị trí "${application.job.title}". Hãy bắt đầu cuộc trò chuyện!`
            );
        }

        return chatResult;
    } catch (error) {
        console.error("Error initiating chat from application:", error);
        return null;
    }
};
