import Notification from "../models/Notification.js";

// Generic send notification (used internally)
export const sendNotification = async (userId, type, message, link = null) => {
  try {
    const payload = {
      type,
      message,
      link: link || null,
      user: userId || null, // null = admin notification
    };

    return await Notification.create(payload);
  } catch (error) {
    console.error("Send Notification Error:", error.message);
  }
};

// Create notification (manual use from frontend)
export const createNotification = async (req, res) => {
  try {
    const { userId, type, message, link } = req.body;

    if (!type || !message) {
      return res.status(400).json({ message: "Type and message are required" });
    }

    const notification = await Notification.create({
      type,
      message,
      link: link || null,
      user: userId || null,
    });

    res.status(201).json({ message: "Notification created", notification });
  } catch (error) {
    console.error("Create Notification Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get notifications for logged in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { user: req.user._id },   // User-specific
        { user: null },           // Admin broadcast, visible to admin if role matches
      ],
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin fetch admin-only notifications
export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: null,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch logged-in user's notifications only
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Mark single notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Not found" });

    notification.read = true;
    await notification.save();

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark As Read Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id },
      { $set: { read: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark All Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
