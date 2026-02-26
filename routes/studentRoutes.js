import express from "express";
import { getNotifications, markNotificationRead } from "../controllers/studentController.js";

import {
  getApprovedCourses,
  enrollCourse,
  getMyCourses,
  viewCourseLectures,
  submitAssignment,
  getMyGrades,
   getProgress,
   getMyAttendance, // ✅ ADD THIS
} from "../controllers/studentController.js";

import { protect, studentOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All routes require Student role
router.use(protect, studentOnly);

// Get all approved courses
router.get("/courses", getApprovedCourses);

// Enroll in course
router.post("/enroll/:courseId", enrollCourse);

// Get my enrolled courses
router.get("/my-courses", getMyCourses);

// View course lectures
router.get("/course/:id", viewCourseLectures);

//Get Notification
router.get("/notifications", protect, studentOnly, getNotifications);


// Submit assignment
router.post("/submit/:assignmentId", upload.single("file"), submitAssignment);
router.put("/notifications/:id/read", protect, studentOnly, markNotificationRead);

// View grades
router.get("/my-grades", getMyGrades);

router.get("/progress", protect, studentOnly, getProgress);
// Attendance ✅ ADD THIS
router.get("/attendance", getMyAttendance);


export default router;
