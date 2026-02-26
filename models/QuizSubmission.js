import mongoose from "mongoose";

const quizSubmissionSchema = mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: [{ questionId: mongoose.Schema.Types.ObjectId, answer: String }],
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("QuizSubmission", quizSubmissionSchema);
