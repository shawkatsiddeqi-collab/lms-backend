import express from "express";
import { registerUser, authUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser); // POST /api/auth/register
router.post("/login", authUser);       // POST /api/auth/login

export default router;
