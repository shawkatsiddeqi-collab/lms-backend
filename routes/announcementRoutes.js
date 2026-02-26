// backend/routes/announcementRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAnnouncements, getAnnouncementById } from "../controllers/announcementController.js";

const router = express.Router();

// Public announcements (for logged-in users)
router.get("/", protect, getAnnouncements);
router.get("/:id", protect, getAnnouncementById);

export default router;