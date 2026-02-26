import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Enrollment from "../models/Enrollment.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Announcement from "../models/Announcement.js"; // ✅ NEW

// ------------------ Admin Dashboard ------------------
export const adminDashboard = async (req, res) => {
  const courses = await Course.find().populate("teacher", "name email");
  const assignments = await Assignment.find().populate("teacher", "name email");
  const submissions = await Submission.find();

  res.json({
    totalCourses: courses.length,
    totalAssignments: assignments.length,
    totalSubmissions: submissions.length,
    courses,
    assignments,
  });
};

// ------------------ Students List for Admin ------------------
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.json(students);
  } catch (err) {
    console.error("getAllStudents error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch students" });
  }
};

// ✅ Teacher list (needed by dashboard + teacher page)
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select("-password");
    res.json(teachers);
  } catch (err) {
    console.error("getAllTeachers error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch teachers" });
  }
};

// View attendance for a course
export const viewAttendanceAdmin = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ message: "courseId is required" });

    const attendanceRecords = await Attendance.find({ course: courseId })
      .populate("user", "name email role")
      .populate("course", "title");

    if (!attendanceRecords.length) {
      return res.json({
        message: "No attendance records found for this course",
        attendanceRecords: [],
      });
    }

    res.json({ attendanceRecords });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ Get Attendance Report for a Course ------------------
export const getAttendanceReport = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ message: "courseId is required" });

    const records = await Attendance.find({ course: courseId })
      .populate("user", "name email role")
      .populate("course", "title");

    if (!records.length) return res.json({ message: "No attendance records found", records: [] });

    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ Mark Attendance ------------------
export const markAttendance = async (req, res) => {
  try {
    const { userId, courseId, status } = req.body;

    if (!userId || !courseId || !status)
      return res.status(400).json({ message: "userId, courseId and status are required" });

    const today = new Date().toISOString().slice(0, 10);

    const attendance = await Attendance.findOne({
      user: userId,
      course: courseId,
      date: today,
    });

    if (attendance) {
      attendance.status = status;
      attendance.markedBy = req.user._id;
      await attendance.save();
      return res.json({ message: "Attendance updated", attendance });
    }

    const newAttendance = await Attendance.create({
      user: userId,
      course: courseId,
      status,
      markedBy: req.user._id,
      date: today,
    });

    res.status(201).json({ message: "Attendance marked", attendance: newAttendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ View Attendance ------------------
export const viewAttendance = async (req, res) => {
  try {
    const userId = req.user._id;
    const courseId = req.query.courseId;

    const query = { user: userId };
    if (courseId) query.course = courseId;

    const attendanceRecords = await Attendance.find(query).populate("course", "title");

    res.json(attendanceRecords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ Course CRUD ------------------
export const getAllCourses = async (req, res) => {
  const courses = await Course.find().populate("teacher", "name email");
  res.json(courses);
};

export const createCourseAdmin = async (req, res) => {
  const { title, description, category, duration, teacher } = req.body;
  const course = await Course.create({
    title,
    description,
    category,
    duration,
    teacher,
    status: "approved",
  });

  if (teacher) {
    await Notification.create({
      user: teacher,
      message: `Admin created course "${title}" for you`,
      type: "info",
    });
  }

  res.status(201).json({ message: "Course created by admin", course });
};

export const updateCourseAdmin = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const { title, description, category, duration, teacher, status } = req.body;
  if (title) course.title = title;
  if (description) course.description = description;
  if (category) course.category = category;
  if (duration) course.duration = duration;
  if (teacher) course.teacher = teacher;
  if (status) course.status = status;

  await course.save();
  res.json({ message: "Course updated by admin", course });
};

export const deleteCourseAdmin = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  await Course.deleteOne({ _id: req.params.id });
  res.json({ message: "Course deleted by admin" });
};

// ------------------ Assignment CRUD ------------------
export const getAllAssignments = async (req, res) => {
  const assignments = await Assignment.find().populate("teacher", "name email");
  res.json(assignments);
};

export const createAssignmentAdmin = async (req, res) => {
  const { courseId, title, description, dueDate, teacher } = req.body;
  const assignment = await Assignment.create({
    course: courseId,
    title,
    description,
    dueDate,
    teacher,
  });

  if (teacher) {
    await Notification.create({
      user: teacher,
      message: `Admin created assignment "${title}" for your course`,
      type: "info",
    });
  }

  res.status(201).json({ message: "Assignment created by admin", assignment });
};

export const updateAssignmentAdmin = async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });

  const { title, description, dueDate, teacher } = req.body;
  if (title) assignment.title = title;
  if (description) assignment.description = description;
  if (dueDate) assignment.dueDate = dueDate;
  if (teacher) assignment.teacher = teacher;

  await assignment.save();
  res.json({ message: "Assignment updated by admin", assignment });
};

export const deleteAssignmentAdmin = async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });

  await Assignment.deleteOne({ _id: req.params.id });
  res.json({ message: "Assignment deleted by admin" });
};

// ------------------ Grade / Submission CRUD ------------------
export const getAllSubmissions = async (req, res) => {
  const submissions = await Submission.find()
    .populate("student", "name email")
    .populate("assignment", "title");
  res.json(submissions);
};

export const updateGradeAdmin = async (req, res) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });

  const { grade, feedback } = req.body;
  if (grade != null) submission.grade = grade;
  if (feedback) submission.feedback = feedback;
  submission.status = "graded";

  await submission.save();
  res.json({ message: "Grade updated by admin", submission });
};

export const deleteGradeAdmin = async (req, res) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });

  submission.grade = null;
  submission.feedback = null;
  submission.status = "submitted";

  await submission.save();
  res.json({ message: "Grade deleted by admin", submission });
};

// ------------------ Course Performance Metrics ------------------
export const getCourseMetricsAdmin = async (req, res) => {
  const { courseId } = req.query;
  if (!courseId) return res.status(400).json({ message: "courseId is required" });

  const course = await Course.findById(courseId)
    .populate("teacher", "name email")
    .populate("studentsEnrolled", "name email");

  if (!course) return res.status(404).json({ message: "Course not found" });

  const assignments = await Assignment.find({ course: courseId });
  const submissions = await Submission.find({
    assignment: { $in: assignments.map((a) => a._id) },
  });

  const attendanceRecords = await Attendance.find({ course: courseId });

  res.json({
    course: course.title,
    teacher: course.teacher,
    totalAssignments: assignments.length,
    totalSubmissions: submissions.length,
    totalStudents: course.studentsEnrolled.length,
    averageGrade: submissions.length
      ? submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / submissions.length
      : 0,
    attendanceSummary: {
      totalRecords: attendanceRecords.length,
      present: attendanceRecords.filter((r) => r.status === "present").length,
      absent: attendanceRecords.filter((r) => r.status === "absent").length,
    },
  });
};

// ------------------ Teacher Activity Logs ------------------
export const getTeacherActivityLogs = async (req, res) => {
  const teachers = await User.find({ role: "teacher" }).select("name email lastLogin");
  res.json({ teachers });
};

// ===================== ✅ Announcements (Admin) =====================

// GET /api/admin/announcements
export const getAdminAnnouncements = async (req, res) => {
  try {
    const list = await Announcement.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch announcements" });
  }
};

// POST /api/admin/announcement   (your frontend is calling this)
export const createAdminAnnouncement = async (req, res) => {
  try {
    const { title, description, roleVisibility, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "title and description are required" });
    }

    const created = await Announcement.create({
      title,
      description,
      roleVisibility: roleVisibility || "all",
      priority: priority || "normal",
      createdBy: req.user._id,
    });

    const populated = await Announcement.findById(created._id).populate(
      "createdBy",
      "name email role"
    );

    res.status(201).json({ message: "Announcement created", announcement: populated });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create announcement" });
  }
};

// PUT /api/admin/announcement/:id
export const updateAdminAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const ann = await Announcement.findById(id);
    if (!ann) return res.status(404).json({ message: "Announcement not found" });

    const { title, description, roleVisibility, priority } = req.body;

    if (title !== undefined) ann.title = title;
    if (description !== undefined) ann.description = description;
    if (roleVisibility !== undefined) ann.roleVisibility = roleVisibility;
    if (priority !== undefined) ann.priority = priority;

    await ann.save();

    const populated = await Announcement.findById(id).populate("createdBy", "name email role");
    res.json({ message: "Announcement updated", announcement: populated });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update announcement" });
  }
};

// DELETE /api/admin/announcement/:id
export const deleteAdminAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const ann = await Announcement.findById(id);
    if (!ann) return res.status(404).json({ message: "Announcement not found" });

    await ann.deleteOne();
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete announcement" });
  }
};