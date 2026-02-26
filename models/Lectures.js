import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String }, // optional text lecture
    type: { 
      type: String, 
      enum: ["text", "video", "pdf", "link"], 
      required: true 
    },
    fileUrl: { type: String }, // file path for pdf/video
    link: { type: String }, // youtube / external
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Lecture = mongoose.model("Lecture", lectureSchema);
export default Lecture;
