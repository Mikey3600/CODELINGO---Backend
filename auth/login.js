import connectDB from "../utils/db";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "METHOD_NOT_ALLOWED" });
  }

  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "NOUSER" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "WRONG" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  return res.json({ message: "LOGGED", token });
}
