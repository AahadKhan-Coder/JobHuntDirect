import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// JWT token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// --- Helper: send verification email ---
const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: user.email,
    subject: "Verify your email",
    html: `<p>Hello ${user.name},</p>
           <p>Verify your email by clicking <a href="${verifyUrl}">here</a>.</p>`,
  });
};

// --- Register ---
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });
    const token = user.createVerificationToken();
    await user.save();

    await sendVerificationEmail(user, token);

    res
      .status(201)
      .json({ message: "Registered successfully. Check your email to verify." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Verify Email ---
export const verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Login ---
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(401).json({ message: "Please verify your email before login" });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// --- Logout ---
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

// --- Get Me ---
export const getMe = async (req, res) => {
  res.json(req.user);
};

// --- Resend Verification ---
export const resendVerification = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Email already verified" });

    const token = user.createVerificationToken();
    await user.save();

    await sendVerificationEmail(user, token);

    res.json({ message: "Verification email sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Google Login ---
export const googleLogin = async (req, res) => {
  const { name, email } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36),
        isVerified: true, // Google users are trusted verified
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ✅ FIX: secure cookie here as well
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Send OTP for forgot password ---
export const sendForgotPasswordOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid 10 mins
    await user.save();

    // Send OTP via email
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: "Your OTP for password reset",
      html: `<p>Hello ${user.name},</p>
             <p>Your OTP for password reset is: <strong>${otp}</strong></p>
             <p>It will expire in 10 minutes.</p>`,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Verify OTP ---
export const verifyForgotPasswordOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.otpCode || user.otpCode !== otp || user.otpExpires < Date.now())
      return res.status(400).json({ message: "Invalid or expired OTP" });

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Reset password ---
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.otpCode || user.otpCode !== otp || user.otpExpires < Date.now())
      return res.status(400).json({ message: "Invalid or expired OTP" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    user.password = newPassword; // will be hashed by pre-save hook
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
