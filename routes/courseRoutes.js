import express from "express";
import { approveCourse, createCourse, getApprovedCourses, getCourseDetails } from "../controllers/courseController.js";
import { protect, role } from "../middleware/authMiddleware.js";
import { addLecture } from "../controllers/courseController.js";



const router = express.Router();

// Admin approves course
router.put("/approve/:id", protect, role("admin"), approveCourse);
router.post("/lecture/:courseId", addLecture);

// Teacher creates a course
router.post("/create", protect, role("teacher"), createCourse);

// Student fetches approved courses
router.get("/approved", protect, role("student"), getApprovedCourses);

// Get course details
router.get("/:id", protect, getCourseDetails);

export default router;
