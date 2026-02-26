// backend/server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import quizRoutes from "./routes/quizRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminReportsRoutes from "./routes/adminReportsRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import adminAnnouncementRoutes from "./routes/adminAnnouncementRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js"; // ✅ ADD THIS

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";



// Middleware
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Base API version
//const API_VERSION = "/api";

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/reports", adminReportsRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/admin/announcements", adminAnnouncementRoutes);
app.use("/api/announcements", announcementRoutes); // ✅ ADD THIS

// Default route
app.get("/", (req, res) => {
  res.send("📚 LMS Backend API is running...");
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
