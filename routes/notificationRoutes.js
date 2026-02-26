import express from "express";
import {
  getNotifications,
  getUserNotifications,
  getAdminNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/all", protect, getNotifications);
router.get("/user", protect, getUserNotifications);
router.get("/admin", protect, getAdminNotifications);
router.post("/", protect, createNotification);
router.put("/read/:id", protect, markAsRead);
router.put("/read-all", protect, markAllAsRead);

export default router;
