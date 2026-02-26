import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    grade: { type: Number, required: true },
    feedback: { type: String },
  },
  { timestamps: true }
);

const Grade = mongoose.model("Grade", gradeSchema);
export default Grade;
