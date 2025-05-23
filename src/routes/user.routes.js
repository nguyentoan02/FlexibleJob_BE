import express from "express";
import auth from "../middlewares/auth.middleware.js";
import isRole from "../middlewares/role.middleware.js";
import { getAllUsers } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", auth, isRole("ADMIN"), getAllUsers);

export default router;
