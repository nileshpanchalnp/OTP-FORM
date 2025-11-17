import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

let otpStore = {}; // TEMP STORAGE (in-memory)

export const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ msg: "Email is required" });

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore[email] = otp;

  await sendEmail(
    email,
    "Your OTP Code",
    `<h2>Your OTP is: <b>${otp}</b></h2>`
  );

  res.json({ msg: "OTP sent" });
};

export const verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] !== otp)
    return res.status(400).json({ msg: "Invalid OTP" });

  delete otpStore[email];
  res.json({ msg: "OTP verified" });
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ msg: "Email already used" });

  const hashedPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    name,
    email,
    password: hashedPassword,
    verified: true,
  });

  res.json({ msg: "User registered successfully", user });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: "Incorrect password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ msg: "Login success", token, user });
};
