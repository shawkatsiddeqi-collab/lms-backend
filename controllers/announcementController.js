// backend/controllers/announcementController.js
import Announcement from "../models/Announcement.js";

// @desc    Get all announcements (for students)
// @route   GET /api/announcements
// @access  Private (Student/Teacher)
export const getAnnouncements = async (req, res) => {
  try {
    const userRole = req.user?.role || "student";

    const announcements = await Announcement.find({
      roleVisibility: { $in: ["all", userRole] },
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    console.error("getAnnouncements error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json(announcement);
  } catch (error) {
    console.error("getAnnouncementById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};