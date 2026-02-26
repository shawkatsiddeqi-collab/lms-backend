import User from "../models/User.js";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Grade from "../models/Grade.js";
import Enrollment from "../models/Enrollment.js";
import Quiz from "../models/Quiz.js"; // Optional if quizzes exist
import QuizSubmission from "../models/QuizSubmission.js"; // Optional

// ✅ Admin Dashboard Metrics
export const getDashboardMetrics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const totalCourses = await Course.countDocuments();
    const pendingApprovals = await User.countDocuments({ status: "pending" });
    const totalAssignments = await Assignment.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    res.json({
      totalStudents,
      totalTeachers,
      totalCourses,
      pendingApprovals,
      totalAssignments,
      totalSubmissions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Student Academic Progress
export const studentProgressReport = async (req, res) => {
  try {
    const students = await User.find({ role: "student" });

    const reports = await Promise.all(
      students.map(async (student) => {
        const enrollments = await Enrollment.find({ student: student._id }).populate("course");
        const grades = await Grade.find({ student: student._id });
        const assignmentsCompleted = await Submission.countDocuments({ student: student._id });

        return {
          student: { name: student.name, email: student.email },
          coursesEnrolled: enrollments.map((en) => en.course.title),
          assignmentsCompleted,
          grades,
        };
      })
    );

    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Teacher Activity Logs
export const teacherActivityReport = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" });

    const activities = await Promise.all(
      teachers.map(async (teacher) => {
        const courses = await Course.find({ teacher: teacher._id });
        const assignments = await Assignment.find({ teacher: teacher._id });
        const lecturesUploaded = courses.reduce((acc, course) => acc + course.lectures.length, 0);

        return {
          teacher: { name: teacher.name, email: teacher.email },
          coursesCreated: courses.length,
          assignmentsCreated: assignments.length,
          lecturesUploaded,
        };
      })
    );

    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Course Performance Metrics
export const coursePerformanceReport = async (req, res) => {
  try {
    const courses = await Course.find().populate("teacher", "name");

    const reports = await Promise.all(
      courses.map(async (course) => {
        const studentsEnrolled = course.studentsEnrolled.length;
        const assignments = await Assignment.find({ course: course._id });
        const submissions = await Submission.find({ assignment: { $in: assignments.map(a => a._id) } });
        const averageGrade = submissions.length
          ? (await Grade.aggregate([
              { $match: { assignment: { $in: assignments.map(a => a._id) } } },
              { $group: { _id: null, avgGrade: { $avg: "$grade" } } },
            ]))[0]?.avgGrade || 0
          : 0;

        return {
          course: course.title,
          teacher: course.teacher.name,
          studentsEnrolled,
          totalAssignments: assignments.length,
          totalSubmissions: submissions.length,
          averageGrade,
        };
      })
    );

    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Pending Approvals
export const pendingApprovals = async (req, res) => {
  try {
    const users = await User.find({ status: "pending" }).select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
