import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import Notification from "../models/Notification.js";

// @desc Register user (Student or Teacher)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      status: "pending", // Await admin approval
    });

    // Notify Admin about new registration
    await Notification.create({
      type: "registration",
      user: null,
      message: `User "${newUser.name}" registered as ${role} and awaiting approval`,
      link: `/admin/users/pending`,
    });

    // Optionally, notify the user themselves
    await Notification.create({
      type: "info",
      user: newUser._id,
      message: `Your account has been created and is pending admin approval`,
      link: `/profile`,
    });

    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// @desc Login user
export const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("=== LOGIN ATTEMPT ===");
    console.log("Email:", email);
    console.log("Password received:", password ? "Yes" : "No");

    // Find user with password field included
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.log("❌ User not found in database");
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    console.log("✅ User found:", user.name);
    console.log("User status:", user.status);
    console.log("User role:", user.role);
    console.log("Password hash exists:", user.password ? "Yes" : "No");

    // Check if user is approved
    if (user.status !== "approved") {
      console.log("❌ User not approved. Status:", user.status);
      return res.status(401).json({ 
        success: false,
        message: "Your account is not approved yet" 
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("❌ Password does not match");
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    console.log("✅ Login successful!");

    return res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};