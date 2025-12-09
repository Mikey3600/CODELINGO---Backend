import connectDB from "../../utils/db";
import User from "../../models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "METHOD_NOT_ALLOWED" });
  }

  const { username, email, password } = req.body;

  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) return res.status(400).json({ message: "EXISTS" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashed,
  });

  return res.json({ message: "REGISTERED", id: user._id });
}
