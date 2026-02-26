import express from "express";
import {
  addFAQ,
  updateFAQ,
  deleteFAQ,
  askQuestion,
  getAllFAQs,
} from "../controllers/chatbotController.js";

import { protect, role } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Admin manages FAQs
router.post("/", protect, role("admin"), addFAQ);
router.put("/:id", protect, role("admin"), updateFAQ);
router.delete("/:id", protect, role("admin"), deleteFAQ);
router.get("/", protect, role("admin"), getAllFAQs);

// ✅ Users ask question
router.post("/ask", protect, askQuestion);

export default router;
