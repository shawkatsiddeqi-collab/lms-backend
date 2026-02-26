import mongoose from "mongoose";

const questionSchema = mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }], // multiple choices
  correctAnswer: { type: String, required: true }, // the exact correct option
});

const quizSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questions: [questionSchema],
    duration: { type: Number, required: true }, // in minutes
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
