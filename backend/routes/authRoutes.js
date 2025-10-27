import express from "express";
import { registerUser, loginUser, logoutUser, getMe, googleLogin, verifyEmail, sendForgotPasswordOTP, verifyForgotPasswordOTP, resetPassword} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);
router.get("/verify-email", verifyEmail);
router.post("/google-login", googleLogin);
router.post("/forgot-password", sendForgotPasswordOTP);
router.post("/verify-otp", verifyForgotPasswordOTP);
router.post("/reset-password", resetPassword);

export default router;
