import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  title: { type: String, default: "Untitled Lecture" },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled Lecture" },
    description: { type: String, required: true },
    category: { type: String, required: true },
    duration: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lectures: [lectureSchema],
    status: { type: String, enum: ["pending","approved"], default: "pending" },
    studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;
