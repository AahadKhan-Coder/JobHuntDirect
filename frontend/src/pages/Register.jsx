import { useState, useContext } from "react";
import API from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import * as jwt_decode from "jwt-decode";
import { User, Mail, Lock, UserPlus, ArrowRight, Briefcase, Sparkles, AlertCircle, CheckCircle, Eye, EyeOff, Info, BriefcaseBusiness } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Regex patterns
  const nameRegex = /^[a-zA-Z\s]{3,30}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    // Validations
    if (!nameRegex.test(name)) {
      setError("Name should be 3-30 letters only");
      setLoading(false);
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Email must be a valid Gmail");
      setLoading(false);
      return;
    }
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 6 chars, include 1 uppercase, 1 number, 1 special char");
      setLoading(false);
      return;
    }

    try {
      // Call backend to register and send verification email
      const res = await API.post("/auth/register", { name, email, password });

      // Display success message for email verification
      setSuccessMsg("Registration successful! Please check your email to verify your account.");
      setLoading(false);

      // Optional: auto-login only after email verification
      // login(res.data);
      // navigate("/");

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    const decoded = jwt_decode(credentialResponse.credential);
    const googleUser = {
      name: decoded.name,
      email: decoded.email,
    };
    try {
      const res = await API.post("/auth/google-login", googleUser);
      login(res.data);
      navigate("/");
    } catch (error) {
      console.error(error);
      setError("Google login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo & Welcome Section */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-50"></div>
              <div className="relative p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-2xl">
                <BriefcaseBusiness className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Create Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Start your journey to find your dream job
          </p>
        </div>

        {/* Main Register Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600 dark:text-green-400">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ben Tennyson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100
                           dark:focus:ring-purple-900 transition-all duration-200
                           bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                3-30 letters only
              </p>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100
                           dark:focus:ring-purple-900 transition-all duration-200
                           bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Gmail address only
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100
                           dark:focus:ring-purple-900 transition-all duration-200
                           bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Min 6 chars, 1 uppercase, 1 number, 1 special char
              </p>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 
                       hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 
                       shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 
                       disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={() => setError("Google Login Failed")}
            />
          </div>

          {/* Footer Links */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 
                         dark:hover:text-purple-300 transition-colors duration-200 inline-flex items-center gap-1"
              >
                Sign in here
                <ArrowRight className="w-4 h-4" />
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}