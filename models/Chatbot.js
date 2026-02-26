import express from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Send message
router.post("/", protect, sendMessage);

// ✅ Get messages with a specific user
router.get("/:userId", protect, getMessages);

export default router;
