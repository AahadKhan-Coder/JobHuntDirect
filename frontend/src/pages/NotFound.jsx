import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">😞</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          404 - Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The page you are looking for does not exist or may have been removed.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
