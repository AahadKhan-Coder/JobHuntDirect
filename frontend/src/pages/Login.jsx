import { useState, useContext } from "react";
import API from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";
import { Mail, Lock, LogIn, ArrowRight, Briefcase, Sparkles, AlertCircle, BriefcaseBusinessIcon, BriefcaseBusiness } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    const decoded = jwtDecode(credentialResponse.credential);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo & Welcome Section */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-50"></div>
              <div className="relative p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-2xl">
                <BriefcaseBusiness className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Sign in to continue your job search
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100
                           dark:focus:ring-blue-900 transition-all duration-200
                           bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100
                           dark:focus:ring-blue-900 transition-all duration-200
                           bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 
                       hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 
                       shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 
                       disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
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
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 
                         dark:hover:text-blue-300 transition-colors duration-200 flex items-center gap-1"
              >
                <Lock className="w-4 h-4" />
                Forgot Password?
              </Link>
              <Link 
                to="/register" 
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 
                         dark:hover:text-indigo-300 transition-colors duration-200 flex items-center gap-1"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          By signing in, you agree to our{" "}
          <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}