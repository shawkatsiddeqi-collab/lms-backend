// backend/controllers/studentController.js
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Grade from "../models/Grade.js";
import Enrollment from "../models/Enrollment.js";
import Notification from "../models/Notification.js";
import Attendance from "../models/Attendance.js"; // ✅ ADD THIS IMPORT
import { sendNotification } from "./notificationController.js";

// ✅ ============ EXISTING FUNCTIONS (keep as is) ============
export const getApprovedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "approved" }).populate("teacher", "name email");
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const existing = await Enrollment.findOne({ student: req.user._id, course: course._id });
    if (existing) return res.status(400).json({ message: "Already enrolled or pending approval" });

    const enrollmentStatus = course.status === "approved" ? "enrolled" : "pending";

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: course._id,
      status: enrollmentStatus,
    });

    if (enrollmentStatus === "enrolled") {
      course.studentsEnrolled.push(req.user._id);
      await course.save();
    }

    await Notification.create({
      user: course.teacher,
      message: `${req.user.name} has requested to enroll in "${course.title}"`,
    });

    res.json({ message: `Enrollment ${enrollmentStatus}`, enrollment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id, status: "enrolled" })
      .populate({ path: "course", populate: { path: "teacher", select: "name email" } });
    
    const courses = enrollments.map(e => e.course);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const viewCourseLectures = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("lectures").populate("teacher", "name");
    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id, status: "enrolled" });
    if (!enrollment) return res.status(403).json({ message: "Access denied" });

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);

    if (!assignment) throw new Error("Assignment not found");

    const alreadySubmitted = await Submission.findOne({
      assignment: assignment._id,
      student: req.user._id,
    });
    if (alreadySubmitted) throw new Error("Already submitted");

    const submission = await Submission.create({
      assignment: assignment._id,
      student: req.user._id,
      fileUrl: req.file.path,
    });

    await sendNotification(
      assignment.teacher,
      "assignment",
      `${req.user.name} submitted assignment "${assignment.title}"`,
      `/teacher/submissions/${assignment._id}`
    );

    res.status(201).json(submission);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

export const getMyGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.user._id })
      .populate("course", "title")
      .populate("assignment", "title")
      .populate("teacher", "name");
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProgress = async (req, res) => {
  try {
    const studentId = req.user._id;

    const enrollments = await Enrollment.find({ student: studentId })
      .populate({
        path: "course",
        select: "title",
      });

    const progress = [];

    for (const enrollment of enrollments) {
      const course = enrollment.course;
      const assignments = await Assignment.find({ course: course._id });
      const grades = await Grade.find({ course: course._id, student: studentId });

      progress.push({
        courseId: course._id,
        courseTitle: course.title,
        totalAssignments: assignments.length,
        gradedAssignments: grades.length,
        grades: grades.map((g) => ({
          assignment: g.assignment,
          grade: g.grade,
        })),
      });
    }

    res.status(200).json({ progress });
  } catch (error) {
    console.error("getProgress error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ ============ ADD THIS NEW FUNCTION ============
// @desc    Get student's attendance records
// @route   GET /api/student/attendance
// @access  Private (Student)
export const getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { month, year, courseId } = req.query;

    // Build filter
    const filter = { user: studentId };

    if (courseId) {
      filter.course = courseId;
    }

    // If month/year provided, filter by date range
    if (month !== undefined && year !== undefined) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, parseInt(month) + 1, 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(filter)
      .populate("course", "title")
      .sort({ date: -1 });

    res.status(200).json(attendance);
  } catch (error) {
    console.error("getMyAttendance error:", error);
    res.status(500).json({ message: "Server error" });
  }
};