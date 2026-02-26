import express from "express";
import {
  createQuiz,
  getCourseQuizzes,
  submitQuiz,
  getQuizSubmissions,
} from "../controllers/quizController.js";

import { protect, role } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Teacher creates quiz
router.post("/create", protect, role("teacher"), createQuiz);

// ✅ Student fetches quizzes
router.get("/course/:courseId", protect, role("student"), getCourseQuizzes);

// ✅ Student submits quiz
router.post("/submit", protect, role("student"), submitQuiz);

// ✅ Teacher views submissions
router.get("/submissions/:quizId", protect, role("teacher"), getQuizSubmissions);

export default router;
