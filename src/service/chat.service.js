import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import CompanyProfile from "../models/companyprofile.model.js";
import socketService from "./socket.service.js"; // Thêm dòng import này

const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

export const createOrGetChat = async (jobseekerId, employerId) => {
    try {
        const jobseeker = await User.findById(jobseekerId);
        const employer = await User.findById(employerId);

        if (!jobseeker || !employer) {
            return dataResponse(404, "User not found", null);
        }

        if (jobseeker.role !== "JOBSEEKER" || employer.role !== "EMPLOYER") {
            return dataResponse(400, "Invalid user roles", null);
        }

        const company = await CompanyProfile.findOne({ user: employerId });
        if (!company) {
            return dataResponse(404, "Company profile not found", null);
        }

        let chat = await Chat.findOne({
            jobseeker: jobseekerId,
            employer: employerId,
        })
            .populate("jobseeker", "firstName lastName imageUrl email")
            .populate("employer", "firstName lastName imageUrl email")
            .populate("company", "companyName imageUrl")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                    select: "firstName lastName imageUrl",
                },
            });

        if (!chat) {
            chat = new Chat({
                participants: [
                    { user: jobseekerId, role: "JOBSEEKER" },
                    { user: employerId, role: "EMPLOYER" },
                ],
                jobseeker: jobseekerId,
                employer: employerId,
                company: company._id,
            });

            await chat.save();

            await chat.populate(
                "jobseeker",
                "firstName lastName imageUrl email"
            );
            await chat.populate(
                "employer",
                "firstName lastName imageUrl email"
            );
            await chat.populate("company", "companyName imageUrl");
        }

        return dataResponse(200, "Chat retrieved successfully", chat);
    } catch (error) {
        console.error("Error in createOrGetChat:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

export const searchEmployers = async (searchTerm, page = 1, limit = 20) => {
    try {
        const skip = (page - 1) * limit;

        const companies = await CompanyProfile.find({
            $and: [
                { isApproved: true },
                { status: true },
                {
                    $or: [
                        { companyName: { $regex: searchTerm, $options: "i" } },
                        {
                            companyDescription: {
                                $regex: searchTerm,
                                $options: "i",
                            },
                        },
                    ],
                },
            ],
        })
            .populate("user", "firstName lastName email")
            .select("companyName imageUrl location user companyDescription")
            .skip(skip)
            .limit(limit);

        return dataResponse(200, "Employers found", companies);
    } catch (error) {
        console.error("Error in searchEmployers:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

export const getAllEmployers = async (page = 1, limit = 20) => {
    try {
        const skip = (page - 1) * limit;

        const companies = await CompanyProfile.find({
            isApproved: true,
            status: true,
        })
            .populate("user", "firstName lastName email")
            .select("companyName imageUrl location user companyDescription")
            .skip(skip)
            .limit(limit);

        return dataResponse(200, "All employers retrieved", companies);
    } catch (error) {
        console.error("Error in getAllEmployers:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

export const createChatWithCompany = async (jobseekerId, companyId) => {
    try {
        const jobseeker = await User.findById(jobseekerId);
        if (!jobseeker || jobseeker.role !== "JOBSEEKER") {
            return dataResponse(404, "Jobseeker not found", null);
        }

        const company = await CompanyProfile.findById(companyId).populate(
            "user"
        );
        if (!company) {
            return dataResponse(404, "Company not found", null);
        }

        const employer = company.user;
        if (!employer || employer.role !== "EMPLOYER") {
            return dataResponse(404, "Employer not found", null);
        }

        return await createOrGetChat(jobseekerId, employer._id);
    } catch (error) {
        console.error("Error in createChatWithCompany:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

export const getUserChats = async (userId, page = 1, limit = 20) => {
    try {
        const skip = (page - 1) * limit;

        const chats = await Chat.find({
            $or: [{ jobseeker: userId }, { employer: userId }],
        })
            .populate("jobseeker", "firstName lastName imageUrl email")
            .populate("employer", "firstName lastName imageUrl email")
            .populate("company", "companyName imageUrl")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                    select: "firstName lastName imageUrl",
                },
            })
            .sort({ lastActivity: -1 })
            .skip(skip)
            .limit(limit);

        const chatsWithUnreadCount = await Promise.all(
            chats.map(async (chat) => {
                const unreadCount = await Message.countDocuments({
                    chat: chat._id,
                    sender: { $ne: userId },
                    isRead: false,
                });

                return {
                    ...chat.toObject(),
                    unreadCount,
                };
            })
        );

        return dataResponse(
            200,
            "Chats retrieved successfully",
            chatsWithUnreadCount
        );
    } catch (error) {
        console.error("Error in getUserChats:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

export const getChatMessages = async (chatId, userId, page = 1, limit = 50) => {
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return dataResponse(404, "Chat not found", null);
        }

        if (
            chat.jobseeker.toString() !== userId &&
            chat.employer.toString() !== userId
        ) {
            return dataResponse(403, "Access denied", null);
        }

        const skip = (page - 1) * limit;

        const messages = await Message.find({ chat: chatId })
            .populate("sender", "firstName lastName imageUrl email role")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        messages.reverse(); // Đảo ngược để messages cũ nhất ở đầu

        return dataResponse(200, "Messages retrieved successfully", {
            messages,
            chatId,
            hasMore: messages.length === limit,
        });
    } catch (error) {
        console.error("Error in getChatMessages:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

export const markMessagesAsRead = async (chatId, userId) => {
    try {
        const result = await Message.updateMany(
            {
                chat: chatId,
                sender: { $ne: userId },
                isRead: false,
            },
            {
                isRead: true,
                readAt: new Date(),
            }
        );

        return dataResponse(200, "Messages marked as read", {
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error("Error in markMessagesAsRead:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

export const deleteChat = async (chatId, userId) => {
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return dataResponse(404, "Chat not found", null);
        }

        if (
            chat.jobseeker.toString() !== userId &&
            chat.employer.toString() !== userId
        ) {
            return dataResponse(403, "Access denied", null);
        }

        await Message.deleteMany({ chat: chatId });
        await Chat.findByIdAndDelete(chatId);

        return dataResponse(200, "Chat deleted successfully", null);
    } catch (error) {
        console.error("Error in deleteChat:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

export const searchChats = async (userId, searchTerm) => {
    try {
        const chats = await Chat.find({
            $or: [{ jobseeker: userId }, { employer: userId }],
        })
            .populate("jobseeker", "firstName lastName imageUrl email")
            .populate("employer", "firstName lastName imageUrl email")
            .populate("company", "companyName imageUrl")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                    select: "firstName lastName imageUrl",
                },
            });

        const filteredChats = chats.filter((chat) => {
            const jobseekerName =
                `${chat.jobseeker.firstName} ${chat.jobseeker.lastName}`.toLowerCase();
            const employerName =
                `${chat.employer.firstName} ${chat.employer.lastName}`.toLowerCase();
            const companyName = chat.company.companyName.toLowerCase();
            const term = searchTerm.toLowerCase();

            return (
                jobseekerName.includes(term) ||
                employerName.includes(term) ||
                companyName.includes(term)
            );
        });

        return dataResponse(200, "Search results", filteredChats);
    } catch (error) {
        console.error("Error in searchChats:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};

// Function gửi tin nhắn
export const sendMessage = async (chatId, senderId, messageData) => {
    try {
        const {
            content,
            messageType = "text",
            fileUrl,
            fileName,
        } = messageData;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return dataResponse(404, "Chat not found", null);
        }

        if (
            chat.jobseeker.toString() !== senderId &&
            chat.employer.toString() !== senderId
        ) {
            return dataResponse(403, "Access denied", null);
        }

        const message = new Message({
            chat: chatId,
            sender: senderId,
            content,
            messageType,
            fileUrl,
            fileName,
        });

        await message.save();
        await message.populate(
            "sender",
            "firstName lastName imageUrl email role"
        );

        chat.lastMessage = message._id;
        chat.lastActivity = new Date();
        await chat.save();

        // Emit event newMessage qua socket
        socketService.emitNewMessage(chatId, message);

        return dataResponse(200, "Message sent successfully", message);
    } catch (error) {
        console.error("Error in sendMessage:", error);
        return dataResponse(500, `Server error: ${error.message}`, null);
    }
};
