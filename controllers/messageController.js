import Message from "../models/Message.js";

// Send message
export const sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;

  if (!receiverId || !content) return res.status(400).json({ message: "All fields required" });

  const message = await Message.create({
    sender: req.user._id,
    receiver: receiverId,
    content,
  });

  res.status(201).json(message);
};

// Get user messages
export const getMessages = async (req, res) => {
  const messages = await Message.find({
    $or: [{ sender: req.user._id }, { receiver: req.user._id }],
  })
    .populate("sender", "name role")
    .populate("receiver", "name role")
    .sort({ createdAt: 1 });

  res.json(messages);
};
