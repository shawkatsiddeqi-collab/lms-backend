import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import { sendNotification } from "../controllers/notificationController.js";

dotenv.config();

const adminData = {
  name: "Admin",
  email: "admin@lms.com",
  password: "Admin@123",
  role: "admin",
  status: "approved",
};

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    const admin = await User.create(adminData);
    console.log("Admin created:", admin.email);

    // Notification for admin creation (optional, can skip)
    await sendNotification(admin._id, "success", "Admin account created successfully");

    process.exit();
  } catch (error) {
    console.error("Admin seeder error:", error);
    process.exit(1);
  }
};

seedAdmin();
