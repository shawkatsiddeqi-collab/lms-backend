import express from "express";
import { protect, role } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  teacherDashboard,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadLecture,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  assignGrade,
  updateGrade,
  deleteGrade,
  approveEnrollment,
  markAttendanceTeacher,
  viewOwnAttendance,
  getAttendanceByCourse,
  viewAttendanceTeacher,
} from "../controllers/teacherController.js";
import { getAnnouncements } from "../controllers/announcementController.js";

const router = express.Router();

router.use(protect, role("teacher"));

// Dashboard
router.get("/dashboard", teacherDashboard);

// Teacher attendance routes
router.post("/attendance/:courseId", markAttendanceTeacher); // mark attendance for students
router.get("/attendance/:courseId", getAttendanceByCourse); // get attendance for a course
router.get("/attendance", viewOwnAttendance);
router.get("/attendance", viewAttendanceTeacher); // teachers view their attendance
// ✅ Teacher announcements (DB)
router.get("/announcements", getAnnouncements);


// Course CRUD
router.post("/create-course", createCourse);
router.put("/course/:id", updateCourse);
// Clean REST route
router.delete("/course/:courseId", protect, role("teacher"), deleteCourse);

// Legacy backward-compatible
router.delete("/delete-course/:courseId", protect, role("teacher"), deleteCourse);


// Lecture
router.post("/upload-lecture/:courseId", upload.single("file"), uploadLecture);

// Assignment CRUD
router.post("/create-assignment", createAssignment);
router.put("/update-assignment/:id", updateAssignment);
router.delete("/delete-assignment/:id", deleteAssignment);



// Grades
router.post("/assign-grade", assignGrade);
router.put("/update-grade/:id", updateGrade);
router.delete("/delete-grade/:id", deleteGrade);

// Approve Enrollment
router.put("/approve-enrollment/:enrollmentId", approveEnrollment);

export default router;
