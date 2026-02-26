import Course from "../models/Course.js";
import Notification from "../models/Notification.js";

// Admin approves a course
export const approveCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("teacher");
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.status = "approved";
    await course.save();

    // Notify teacher
    await Notification.create({
      type: "course_approved",
      user: course.teacher._id,
      message: `Your course "${course.title}" has been approved by admin`,
      link: `/teacher/courses/${course._id}`,
    });

    res.json({ message: "Course approved successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Teacher creates a course
export const createCourse = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    const course = await Course.create({
      title,
      description,
      category,
      teacher: req.user._id,
      status: "pending",
    });

    // Admin notification
    await Notification.create({
      type: "info",
      user: null,
      message: `New course "${course.title}" created by ${req.user.name} and awaiting approval`,
      link: `/admin/courses/pending`,
    });

    // Teacher notification
    await Notification.create({
      type: "success",
      user: req.user._id,
      message: `Your course "${course.title}" has been created successfully`,
      link: `/teacher/courses/${course._id}`,
    });

    res.status(201).json(course);
  } catch (error) {
    console.error("createCourse error:", error);
    res.status(400).json({ message: error.message });
  }
};

export const addLecture = async (req, res) => {
  try {
    const { title, description, videoUrl, freePreview } = req.body;
    const { courseId } = req.params;

    if (!title || !description || !videoUrl) {
      return res.status(400).json({ message: "All lecture fields required" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.lectures.push({
      title,
      description,
      videoUrl,
      freePreview: freePreview || false,
    });

    await course.save();
    return res.json({ message: "Lecture added successfully", course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get all approved courses
export const getApprovedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "approved" }).populate(
      "teacher",
      "name email"
    );
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get course details by ID
export const getCourseDetails = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "teacher",
      "name email"
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
