import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    // ✅ "user" = the student whose attendance is being marked
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },

    date: { type: Date, default: Date.now },

    status: { type: String, enum: ["present", "absent"], required: true },

    // ✅ who marked it (teacher/admin)
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;