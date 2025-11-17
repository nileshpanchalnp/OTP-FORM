import express from "express";
import { sendOTP, verifyOTP, registerUser, loginUser } from "../controllers/user.js";

const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
