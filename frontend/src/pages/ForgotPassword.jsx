import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // --- Step 1: Send OTP ---
  const handleSendOTP = async () => {
    try {
      const res = await API.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending OTP");
    }
  };

  // --- Step 2: Verify OTP ---
  const handleVerifyOTP = async () => {
    try {
      const res = await API.post("/auth/verify-otp", { email, otp });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
    }
  };

  // --- Step 3: Reset Password ---
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      const res = await API.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      setMessage(res.data.message);

      // ✅ Redirect to home page after 1 second
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Password reset failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow text-center">
      <h1 className="text-xl font-bold mb-4">Forgot Password</h1>
      {message && <p className="mb-4 text-red-500">{message}</p>}

      {step === 1 && (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full mb-4"
          />
          <button
            onClick={handleSendOTP}
            className="bg-blue-500 text-white p-2 w-full rounded"
          >
            Send OTP
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-2 w-full mb-4"
          />
          <button
            onClick={handleVerifyOTP}
            className="bg-blue-500 text-white p-2 w-full rounded"
          >
            Verify OTP
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 w-full mb-4"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border p-2 w-full mb-4"
          />
          <button
            onClick={handleResetPassword}
            className="bg-green-500 text-white p-2 w-full rounded"
          >
            Reset Password
          </button>
        </>
      )}
    </div>
  );
}
