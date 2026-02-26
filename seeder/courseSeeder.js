import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { sendNotification } from "../controllers/notificationController.js";

dotenv.config();

// Example courses
const coursesData = [
  {
    title: "Introduction to Programming",
    description: "Learn the basics of programming with hands-on examples",
    category: "Computer Science",
  },
  {
    title: "Advanced Zoology",
    description: "Deep dive into animal physiology and behavior",
    category: "Zoology",
  },
];

const seedCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Get any teacher to assign courses
    const teacher = await User.findOne({ role: "teacher" });
    if (!teacher) {
      console.log("No teacher found. Please create a teacher first.");
      process.exit();
    }

    for (const courseData of coursesData) {
      const course = await Course.create({
        ...courseData,
        teacher: teacher._id,
        status: "pending",
      });

      console.log(`Course created: ${course.title}`);

      // Notify admin about new course
      await sendNotification(
        null,
        "info",
        `New course "${course.title}" created by ${teacher.name} and awaiting approval`
      );

      // Notify teacher
      await sendNotification(
        teacher._id,
        "success",
        `Your course "${course.title}" has been created successfully`
      );
    }

    process.exit();
  } catch (error) {
    console.error("Course seeder error:", error);
    process.exit(1);
  }
};

seedCourses();
