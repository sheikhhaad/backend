import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Models/user.js";

// Signup
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "5d" }
    );

    res.cookie("token", token, { httpOnly: true });
    res.status(201).json({ message: "Signup successful", user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "5d" }
    );

    res.cookie("token", token, { httpOnly: true });
    res.json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};
