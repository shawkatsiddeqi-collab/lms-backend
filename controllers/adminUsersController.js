import User from "../models/User.js";

// GET /api/admin/students
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch students" });
  }
};

// GET /api/admin/teachers
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select("-password");
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch teachers" });
  }
};

// POST /api/admin/add-student
export const addStudentAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const student = await User.create({
      name,
      email,
      password,                 // hashing remains in User model pre-save
      phone: phone || "",       // ✅ NEW
      role: "student",
      status: status || "pending",
    });

    res.status(201).json({
      message: "Student created successfully",
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,   // ✅ NEW
        role: student.role,
        status: student.status,
        createdAt: student.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create student" });
  }
};

// POST /api/admin/add-teacher
export const addTeacherAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const teacher = await User.create({
      name,
      email,
      password,                 // hashing remains in User model pre-save
      phone: phone || "",       // ✅ NEW
      role: "teacher",
      status: status || "pending",
    });

    res.status(201).json({
      message: "Teacher created successfully",
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,   // ✅ NEW
        role: teacher.role,
        status: teacher.status,
        createdAt: teacher.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create teacher" });
  }
};

// PATCH /api/admin/update-user/:id
export const updateUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status, password } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;

    // ✅ NEW: Update phone if provided (keep existing if not)
    if (phone !== undefined) user.phone = phone;

    if (status !== undefined) user.status = status;

    if (password && password.trim().length > 0) {
      user.password = password; // hashing remains in User model pre-save
    }

    const updated = await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,    // ✅ NEW
        role: updated.role,
        status: updated.status,
        createdAt: updated.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update user" });
  }
};

// DELETE /api/admin/delete-user/:id
export const deleteUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete user" });
  }
};