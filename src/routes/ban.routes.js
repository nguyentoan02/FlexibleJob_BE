import { Router } from "express";
import { banUser, unbanUser } from "../controllers/ban.controller.js";
import auth from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = Router();

// Ban/Unban user routes
router.put("/ban/:userId", auth, checkRole(["ADMIN"]), banUser); // Ban user
router.put("/unban/:userId", auth, checkRole(["ADMIN"]), unbanUser); // Unban user

export default router; 