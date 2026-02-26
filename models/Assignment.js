import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, default: Date.now },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lecture: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture" },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "closed"], default: "active" },
  },
  { timestamps: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
