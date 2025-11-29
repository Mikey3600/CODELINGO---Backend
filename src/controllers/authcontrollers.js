

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";


const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password) =>
  password && password.length >= 8;

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const healthCheck = async (req, res) => {
  res.status(200).json({ status: "ok", time: new Date().toISOString() });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const errors = {};

    if (!name || name.trim().length < 2)
      errors.name = "Name must be at least 2 characters";

    if (!email || !validateEmail(email))
      errors.email = "A valid email is required";

    if (!validatePassword(password))
      errors.password = "Password must be at least 8 characters long";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({
        error: "Email already in use",
        details: { email: "This email is already registered" },
      });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash: hashed,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarEmoji: user.avatarEmoji,
        totalXP: user.totalXP,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: "Registration failed" });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        error: "Email and password are required",
      });

    if (!validateEmail(email))
      return res.status(400).json({
        error: "Invalid email format",
      });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({
        error: "Invalid email or password",
      });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({
        error: "Invalid email or password",
      });

    const token = generateToken(user._id);

    return res.status(200).json({
      token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarEmoji: user.avatarEmoji,
        totalXP: user.totalXP,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Login failed" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarEmoji: user.avatarEmoji,
        totalXP: user.totalXP,
        streakDays: user.streakDays,
      },
    });
  } catch (err) {
    console.error("GET ME ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
};

