import Chatbot from "../models/Chatbot.js";

// ✅ Add FAQ / Training Question (Admin only)
export const addFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;

    const existing = await Chatbot.findOne({ question });
    if (existing) {
      return res.status(400).json({ message: "Question already exists" });
    }

    const faq = await Chatbot.create({ question, answer, category });
    res.status(201).json({ message: "FAQ added successfully", faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update FAQ (Admin only)
export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category } = req.body;

    const faq = await Chatbot.findById(id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });

    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;
    faq.category = category || faq.category;

    await faq.save();
    res.json({ message: "FAQ updated successfully", faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete FAQ (Admin only)
export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await Chatbot.findById(id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });

    await faq.remove();
    res.json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ User asks question: chatbot searches FAQ and returns answer
export const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    // Simple keyword match
    const faq = await Chatbot.findOne({ question: { $regex: question, $options: "i" } });

    if (faq) {
      return res.json({ answer: faq.answer });
    }

    // If no FAQ match, return default message
    res.json({ answer: "Sorry, I do not have an answer for that yet. Admin will review your question." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin fetch all FAQs
export const getAllFAQs = async (req, res) => {
  try {
    const faqs = await Chatbot.find().sort({ createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
