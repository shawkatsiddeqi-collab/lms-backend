import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // admin/general notifications allowed
    },
    type: {
      type: String,
      enum: [
        "info",
        "success",
        "warning",
        "error",
        "lecture_posted",
        "assignment_posted",
        "submission_received",
        "graded",
        "course_approved",
        "registration",
        "enrollment_request",
        "enrollment_approved",
      ],
      required: true,
    },
    message: { type: String, required: true },
    link: { type: String, default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
