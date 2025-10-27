import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../utils/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid verification link");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await API.get(`/auth/verify-email?token=${token}`);
        setMessage(res.data.message);
      } catch (err) {
        setMessage(err.response?.data?.message || "Verification failed");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow text-center">
      <h1 className="text-xl font-bold mb-4">Email Verification</h1>
      <p className="mb-4">{message}</p>
      <Link to="/login" className="text-blue-500 underline">
        Go to Login
      </Link>
    </div>
  );
}
