import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js"; // Only once
import Submission from "../models/Submission.js";
import Grade from "../models/Grade.js";
import Enrollment from "../models/Enrollment.js";
import Notification from "../models/Notification.js";
import Attendance from "../models/Attendance.js";


// ✅ Teacher dashboardimport Course from "../models/Course.js";


// ------------------ Teacher Dashboard ------------------
export const teacherDashboard = async (req, res) => {
  const courses = await Course.find({ teacher: req.user._id }).populate(
    "studentsEnrolled",
    "name email"
  );
  res.json({ totalCourses: courses.length, courses });
};


// Teacher marks attendance
export const markAttendanceTeacher = async (req, res) => {
  try {
    const { studentId, status, date } = req.body;
    const { courseId } = req.params;

    if (!studentId || !status) {
      return res.status(400).json({ message: "studentId and status required" });
    }

    // ✅ Store the date teacher selected (if sent), otherwise now
    const attendanceDate = date ? new Date(date) : new Date();

    const record = await Attendance.create({
      user: studentId,          // ✅ FIXED (was student)
      course: courseId,
      status,
      date: attendanceDate,
      markedBy: req.user._id,   // ✅ now exists in schema
    });

    res.status(201).json({ message: "Attendance marked by teacher", record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get attendance for a course (Teacher)
export const getAttendanceByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const records = await Attendance.find({ course: courseId })
      .populate("user", "name email")       // ✅ FIXED (was student)
      .populate("markedBy", "name email");  // ✅ now valid

    res.json({ total: records.length, records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Teacher views own attendance
export const viewOwnAttendance = async (req, res) => {
  try {
    const userId = req.user._id;
    const courseId = req.query.courseId;

    const query = { user: userId };
    if (courseId) query.course = courseId;

    const records = await Attendance.find(query).populate("course", "title");
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ Teacher: View Attendance ------------------
export const viewAttendanceTeacher = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const courses = await Course.find({ teacher: teacherId }).select("_id");
    const courseIds = courses.map((c) => c._id);

    const records = await Attendance.find({ course: { $in: courseIds } })
      .populate("user", "name email role")  // ✅ user = student
      .populate("course", "title")
      .populate("markedBy", "name email");

    if (!records.length) {
      return res.json({ message: "No attendance records found", records: [] });
    }

    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ Course CRUD ------------------

// Create course (existing)
export const createCourse = async (req, res) => {
  const { title, description, category, duration } = req.body;
  const course = await Course.create({
    title,
    description,
    category,
    duration,
    teacher: req.user._id,
    status: "pending",
  });

  await Notification.create({
    user: null,
    message: `Teacher ${req.user.name} created course "${title}", awaiting admin approval`,
  });

  res.status(201).json(course);
};

// Update course
export const updateCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  if (req.user.role === "teacher" && course.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const { title, description, category, duration } = req.body;
  if (title) course.title = title;
  if (description) course.description = description;
  if (category) course.category = category;
  if (duration) course.duration = duration;

  await course.save();
  res.json({ message: "Course updated", course });
};

// Delete course
export const deleteCourse = async (req, res) => {
  const courseId = req.params.courseId || req.params.id;

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  if (req.user.role === "teacher" && course.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await Course.deleteOne({ _id: courseId });

  await Notification.create({
    user: null,
    message: `Course "${course.title}" has been deleted`,
    type: "info",
  });

  res.json({ message: "Course deleted", course });
};


// ------------------ Lecture Upload (existing) ------------------
export const uploadLecture = async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });
  if (course.teacher.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Not authorized" });

  course.lectures.push({
    title: req.body.title,
    fileUrl: req.file.path,
  });
  await course.save();

  // Notify enrolled students
  const enrollments = await Enrollment.find({ course: course._id, status: "approved" });
  const notifications = enrollments.map((en) => ({
    user: en.student,
    type: "lecture",
    title: `New Lecture: ${req.body.title}`,
    message: `A new lecture has been uploaded for the course "${course.title}".`,
  }));

  await Notification.insertMany(notifications);
  res.json({ message: "Lecture uploaded and students notified" });
};

// ------------------ Assignment CRUD ------------------

// Create assignment (existing)
export const createAssignment = async (req, res) => {
  const { courseId, title, description, dueDate } = req.body;
  const assignment = await Assignment.create({
    course: courseId,
    title,
    description,
    dueDate,
    teacher: req.user._id,
  });

  await Notification.create({
    user: null,
    type: "assignment",
    message: `Assignment "${title}" created for course`,
  });

  res.status(201).json({ message: "Assignment created", assignment });
};

// Update assignment
export const updateAssignment = async (req, res) => {
  const id = req.params.id;
  const assignment = await Assignment.findById(id);
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });

  if (req.user.role === "teacher" && assignment.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const { title, description, dueDate } = req.body;
  if (title) assignment.title = title;
  if (description) assignment.description = description;
  if (dueDate) assignment.dueDate = dueDate;

  await assignment.save();
  res.json({ message: "Assignment updated", assignment });
};


// Delete assignment
export const deleteAssignment = async (req, res) => {
  const id = req.params.id;
  const assignment = await Assignment.findById(id);
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });

  if (req.user.role === "teacher" && assignment.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await Assignment.deleteOne({ _id: id });

  await Notification.create({
    user: null,
    message: `Assignment "${assignment.title}" deleted`,
    type: "info",
  });

  res.json({ message: "Assignment deleted" });
};


// ------------------ Grade CRUD ------------------

// Assign/update grade (existing)
export const assignGrade = async (req, res) => {
  try {
    const studentId = req.body.studentId || req.body.student;
    const assignmentId = req.body.assignmentId || req.body.assignment;
    const grade = req.body.grade || req.body.marks;

    if (!studentId || !assignmentId || grade == null)
      return res.status(400).json({ message: "studentId, assignmentId and grade are required" });

    const submission = await Submission.findOne({ student: studentId, assignment: assignmentId });
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    submission.grade = grade;
    submission.status = "graded";
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();

    await submission.save();
    res.json({ message: "Grade assigned", submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update grade
export const updateGrade = async (req, res) => {
  const id = req.params.id;
  const submission = await Submission.findById(id)
    .populate("student")
    .populate("assignment");

  if (!submission) return res.status(404).json({ message: "Submission not found" });

  // Permission check
  if (req.user.role === "teacher") {
    if (submission.gradedBy && submission.gradedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
  }

  const { grade, feedback } = req.body;
  if (grade != null) submission.grade = grade;
  if (feedback) submission.feedback = feedback;
  submission.status = "graded";
  submission.gradedBy = req.user._id;
  submission.gradedAt = new Date();

  await submission.save();
  res.json({ message: "Grade updated", submission });
};



// Delete grade
export const deleteGrade = async (req, res) => {
  const id = req.params.id;
  const submission = await Submission.findById(id)
    .populate("student")
    .populate("assignment");

  if (!submission) return res.status(404).json({ message: "Submission not found" });

  if (req.user.role === "teacher") {
    if (submission.gradedBy && submission.gradedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
  }

  submission.grade = null;
  submission.feedback = null;
  submission.gradedBy = null;
  submission.gradedAt = null;
  submission.status = "submitted";

  await submission.save();
  res.json({ message: "Grade removed", submission });
};



// ------------------ Approve Enrollment ------------------
export const approveEnrollment = async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.enrollmentId);
  if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

  enrollment.status = "enrolled";
  await enrollment.save();

  const course = await Course.findById(enrollment.course);
  course.studentsEnrolled.push(enrollment.student);
  await course.save();

  await Notification.create({
    user: enrollment.student,
    message: `Your enrollment in "${course.title}" has been approved`,
  });

  res.json({ message: "Enrollment approved", enrollment });
};
