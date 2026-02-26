import express from "express";
import { protect, role } from "../middleware/authMiddleware.js";

import {
  getAdminAnnouncements,
  createAdminAnnouncement,
  updateAdminAnnouncement,
  deleteAdminAnnouncement,
} from "../controllers/adminAnnouncementController.js";

const router = express.Router();

router.use(protect, role("admin"));

router.route("/")
  .get(getAdminAnnouncements)
  .post(createAdminAnnouncement);

router.route("/:id")
  .put(updateAdminAnnouncement)
  .delete(deleteAdminAnnouncement);

export default router;