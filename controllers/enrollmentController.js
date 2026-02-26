import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Notification from "../models/Notification.js";

// Approve enrollment (Teacher/Admin)
export const approveEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate("student")
      .populate("course");

    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    enrollment.status = "approved";
    await enrollment.save();

    // Notify student
    await Notification.create({
      user: enrollment.student._id,
      type: "enrollment_approved",
      message: `Your enrollment for "${enrollment.course.title}" has been approved`,
      link: `/courses/${enrollment.course._id}`,
    });

    res.json({ message: "Enrollment approved", enrollment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student views their enrolled courses
export const myEnrollments = async (req, res) => {
  try {
    const studentId = req.user._id;

    const enrollments = await Enrollment.find({ student: studentId })
      .populate("course", "title description category teacher");

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Request enrollment
export const requestEnrollment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate("teacher");
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      student: req.user._id,
      course: course._id,
    });
    if (existing) return res.status(400).json({ message: "Already requested/enrolled" });

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: course._id,
      status: "pending",
    });

    // Notify Teacher about new request
    await Notification.create({
      user: course.teacher._id,
      type: "enrollment_request",
      message: `${req.user.name} requested enrollment in "${course.title}"`,
      link: `/enrollments/${enrollment._id}`,
    });

    res.status(201).json({ message: "Enrollment request sent", enrollment });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
