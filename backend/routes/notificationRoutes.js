import { Router } from "express";
import {
  getNotifications,
  markAllRead,
  markRead,
} from "../controllers/notificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();
router.use(authMiddleware);
router.get("/", getNotifications);
router.put("/read-all", markAllRead);
router.put("/:id/read", markRead);
export default router;
