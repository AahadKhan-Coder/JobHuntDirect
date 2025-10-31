import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Search, Briefcase, AlertCircle } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      
      <div className="max-w-2xl w-full">
        
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
          
          {/* 404 Icon */}
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>

          {/* 404 Large Text */}
          <h1 className="text-7xl sm:text-8xl font-extrabold mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            404
          </h1>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            The page you are looking for doesn't exist or may have been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-semibold transition-colors duration-200 inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => navigate("/")}
              className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors duration-200"
            >
              <Search className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Browse Jobs</p>
            </button>
            
            <button
              onClick={() => navigate("/saved")}
              className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors duration-200"
            >
              <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Saved Jobs</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}