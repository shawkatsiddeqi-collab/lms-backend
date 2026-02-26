import express from "express";
import { requestEnrollment, approveEnrollment, myEnrollments } from "../controllers/enrollmentController.js";
import { protect, role } from "../middleware/authMiddleware.js";

const router = express.Router();

// Teacher/Admin approves enrollment
router.put("/approve/:id", protect, role("teacher"), approveEnrollment);

// Student requests enrollment
router.post("/request/:courseId", protect, role("student"), requestEnrollment);

// Student views their enrollments
router.get("/my", protect, role("student"), myEnrollments);

export default router;
