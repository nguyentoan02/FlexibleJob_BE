import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { secret } from "../config/jwt.js";
import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";

class SocketService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map();
    }

    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true,
            },
        });

        this.io.use(async (socket, next) => {
            try {
                // Sử dụng auth thay vì query
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error("No token provided"));
                }
                const jwtSecret = secret || process.env.JWT_SECRET;
                const decoded = jwt.verify(token, jwtSecret);
                const user = await User.findById(decoded.id).select(
                    "-password"
                );
                if (!user) return next(new Error("User not found"));
                if (user.isBanned) return next(new Error("User is banned"));
                socket.userId = user._id.toString();
                socket.user = user;
                next();
            } catch (error) {
                console.error("Socket authentication error:", error);
                next(new Error("Authentication failed"));
            }
        });

        this.io.on("connection", (socket) => {
            console.log(`User ${socket.user.email} connected`);
            this.connectedUsers.set(socket.userId, socket.id);
            this.joinUserRooms(socket);

            socket.on("joinChat", (chatId) => {
                socket.join(`chat_${chatId}`);
                socket.emit("joined_chat", { chatId });
            });

            socket.on("leaveChat", (chatId) => {
                socket.leave(`chat_${chatId}`);
            });

            // Sửa event thành sendMessage
            socket.on("sendMessage", async (data) => {
                await this.handleSendMessage(socket, data);
            });

            socket.on("disconnect", () => {
                console.log(`User ${socket.user.email} disconnected`);
                this.connectedUsers.delete(socket.userId);
            });
        });
    }

    async joinUserRooms(socket) {
        try {
            const chats = await Chat.find({
                $or: [
                    { jobseeker: socket.userId },
                    { employer: socket.userId },
                ],
            });
            chats.forEach((chat) => {
                socket.join(`chat_${chat._id}`);
            });
        } catch (error) {
            console.error("Error joining user rooms:", error);
        }
    }

    // Sửa event thành sendMessage và emit newMessage
    async handleSendMessage(socket, data) {
        try {
            const {
                chatId,
                content,
                messageType = "text",
                fileUrl,
                fileName,
            } = data;

            const chat = await Chat.findById(chatId);
            if (!chat) {
                socket.emit("error", { message: "Chat not found" });
                return;
            }

            if (
                chat.jobseeker.toString() !== socket.userId &&
                chat.employer.toString() !== socket.userId
            ) {
                socket.emit("error", { message: "Access denied" });
                return;
            }

            const message = new Message({
                chat: chatId,
                sender: socket.userId,
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

            // Emit event newMessage cho FE
            this.io.to(`chat_${chatId}`).emit("newMessage", {
                message: message,
                chat: chatId,
            });
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", { message: "Failed to send message" });
        }
    }

    // Hàm này để emit khi gửi qua REST API
    emitNewMessage(chatId, message) {
        if (this.io) {
            this.io.to(`chat_${chatId}`).emit("newMessage", {
                message,
                chat: chatId,
            });
        }
    }
}

export default new SocketService();
