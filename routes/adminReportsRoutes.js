import express from "express";
import {
  getDashboardMetrics,
  studentProgressReport,
  teacherActivityReport,
  coursePerformanceReport,
  pendingApprovals,
} from "../controllers/adminReportsController.js";

import { protect, role } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Admin-only routes
router.use(protect, role("admin"));

router.get("/dashboard", getDashboardMetrics);
router.get("/students", studentProgressReport);
router.get("/teachers", teacherActivityReport);
router.get("/courses", coursePerformanceReport);
router.get("/pending-approvals", pendingApprovals);

export default router;
