import express from "express";
import connectDB from "./src/config/db.js";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import http from "http"; // Thêm dòng này
import socketService from "./src/service/socket.service.js"; // Thêm dòng này

dotenv.config();

import passport from "passport";
import "./src/config/passport.js";

// Import the main router
import mainRouter from "./src/routes/index.routes.js";

const app = express();
const server = http.createServer(app); // Thêm dòng này

app.use(cors());
app.use(express.json());

app.use(passport.initialize());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.IO
socketService.initialize(server); // Thêm dòng này

// Mount the main router
app.use("/api", mainRouter);

const PORT = process.env.PORT || 5000;
connectDB()
    .then(() => {
        // Thay đổi từ app.listen thành server.listen
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log("Cannot connect to DB", error);
    });
