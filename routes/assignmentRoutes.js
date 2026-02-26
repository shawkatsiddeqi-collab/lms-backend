import express from "express";
import { protect, role } from "../middleware/authMiddleware.js";
import {
  createAssignment,
  getSubmissions,
  getAssignments,
  getAssignmentDetails,
} from "../controllers/assignmentController.js"; // ✅ all functions exist now

const router = express.Router(); // must be declared before using

// Routes
router.post("/create", protect, role("teacher"), createAssignment);
router.get("/", protect, getAssignments);
router.get("/:assignmentId", protect, getAssignmentDetails);
router.get("/submissions/:assignmentId", protect, role("teacher"), getSubmissions);

export default router;
