import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req,res,next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("No token provided");
  }
};

// Role checks
export const studentOnly = (req,res,next) => {
  if(req.user && req.user.role === "student") next();
  else {
    res.status(403);
    throw new Error("Student access only");
  }
};

export const teacherOnly = (req,res,next) => {
  if(req.user && req.user.role === "teacher") next();
  else {
    res.status(403);
    throw new Error("Teacher access only");
  }
};

export const role = (...allowed) => {
  return (req,res,next) => {
    if(!allowed.includes(req.user.role)){
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};