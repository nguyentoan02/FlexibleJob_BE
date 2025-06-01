import express from "express";
import connectDB from "./src/config/db.js";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import passport from "passport";
import "./src/config/passport.js";

// Import the main router
import mainRouter from "./src/routes/index.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use(passport.initialize());
app.use(morgan("dev"));

// Mount the main router
app.use("/api", mainRouter);

const PORT = process.env.PORT || 5000;
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log("Cannot connect to DB", error);
    });
