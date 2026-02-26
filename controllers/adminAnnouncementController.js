import Announcement from "../models/Announcement.js";

// GET /api/admin/announcements
export const getAdminAnnouncements = async (req, res) => {
  try {
    const { q, roleVisibility, priority } = req.query;

    const filter = {};
    if (roleVisibility && roleVisibility !== "all") filter.roleVisibility = roleVisibility;
    if (priority && priority !== "all") filter.priority = priority;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const announcements = await Announcement.find(filter)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch announcements" });
  }
};

// POST /api/admin/announcements
export const createAdminAnnouncement = async (req, res) => {
  try {
    const { title, description, roleVisibility, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "title and description are required" });
    }

    const announcement = await Announcement.create({
      title,
      description,
      roleVisibility: roleVisibility || "all",
      priority: priority || "normal",
      createdBy: req.user._id,
    });

    const populated = await Announcement.findById(announcement._id).populate(
      "createdBy",
      "name email role"
    );

    res.status(201).json({ message: "Announcement created", announcement: populated });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create announcement" });
  }
};

// PUT /api/admin/announcements/:id
export const updateAdminAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    const { title, description, roleVisibility, priority } = req.body;

    if (title !== undefined) announcement.title = title;
    if (description !== undefined) announcement.description = description;
    if (roleVisibility !== undefined) announcement.roleVisibility = roleVisibility;
    if (priority !== undefined) announcement.priority = priority;

    await announcement.save();

    const populated = await Announcement.findById(id).populate("createdBy", "name email role");

    res.json({ message: "Announcement updated", announcement: populated });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update announcement" });
  }
};

// DELETE /api/admin/announcements/:id
export const deleteAdminAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    await announcement.deleteOne();

    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete announcement" });
  }
};