import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String }, // PDF, DOCX, etc.
    text: { type: String }, // optional written answer
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number },
    feedback: { type: String },
    status: { type: String, enum: ["submitted", "graded"], default: "submitted" },
  },
  { timestamps: true }
);

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
