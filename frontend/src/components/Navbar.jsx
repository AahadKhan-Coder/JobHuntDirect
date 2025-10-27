import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { Home, Bookmark, Shield, LogIn, UserPlus, LogOut, Edit3, FileText, Briefcase, Sparkles, BriefcaseBusiness } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <>
      {/* --- Mobile Top Header --- */}
      <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 md:hidden sticky top-0 z-40 shadow-sm">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-lg">
            <BriefcaseBusiness className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            JobHuntDirect
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* --- Desktop / Tablet Top Navbar --- */}
      <nav className="hidden md:flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              JobHuntDirect
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Sparkles className="w-3 h-3" />
              <span>Find Your Dream Job</span>
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* Jobs Link */}
          <Link 
            to="/" 
            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium flex items-center gap-2"
          >
            <Home size={18} />
            <span>Jobs</span>
          </Link>

          {/* Saved Link */}
          {user && (
            <Link 
              to="/saved" 
              className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 font-medium flex items-center gap-2"
            >
              <Bookmark size={18} />
              <span>Saved</span>
            </Link>
          )}

          {/* Admin Links */}
          {user?.isAdmin && (
            <>
              <Link 
                to="/admin" 
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 font-medium flex items-center gap-2"
              >
                <Edit3 size={18} />
                <span>Create Job</span>
              </Link>
              <Link 
                to="/admin/manage-jobs" 
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-800 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200 font-medium flex items-center gap-2"
              >
                <FileText size={18} />
                <span>Manage Jobs</span>
              </Link>
            </>
          )}

          {/* Auth Buttons */}
          {user ? (
            <button 
              onClick={logout} 
              className="ml-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link 
                to="/login" 
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
              >
                <LogIn size={18} />
                <span>Login</span>
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
              >
                <UserPlus size={18} />
                <span>Signup</span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* --- Mobile Bottom Navbar --- */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-2xl flex justify-around items-center py-2 px-1 md:hidden z-50">
        <Link 
          to="/" 
          className="flex flex-col items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 min-w-[60px]"
        >
          <div className="relative">
            <Home size={22} />
          </div>
          <span className="font-medium">Jobs</span>
        </Link>

        {user && (
          <Link 
            to="/saved" 
            className="flex flex-col items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-800 min-w-[60px]"
          >
            <div className="relative">
              <Bookmark size={22} />
            </div>
            <span className="font-medium">Saved</span>
          </Link>
        )}

        {/* Admin Links */}
        {user?.isAdmin && (
          <>
            <Link 
              to="/admin" 
              className="flex flex-col items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-gray-800 min-w-[60px]"
            >
              <div className="relative">
                <Edit3 size={22} />
              </div>
              <span className="font-medium">Create</span>
            </Link>
            <Link 
              to="/admin/manage-jobs" 
              className="flex flex-col items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200 p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-gray-800 min-w-[60px]"
            >
              <div className="relative">
                <FileText size={22} />
              </div>
              <span className="font-medium">Manage</span>
            </Link>
          </>
        )}

        {user ? (
          <button 
            onClick={logout} 
            className="flex flex-col items-center gap-1 text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500 transition-all duration-200 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-gray-800 min-w-[60px]"
          >
            <div className="relative">
              <LogOut size={22} />
            </div>
            <span className="font-medium">Logout</span>
          </button>
        ) : (
          <>
            <Link 
              to="/login" 
              className="flex flex-col items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 min-w-[60px]"
            >
              <div className="relative">
                <LogIn size={22} />
              </div>
              <span className="font-medium">Login</span>
            </Link>
            <Link 
              to="/register" 
              className="flex flex-col items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 min-w-[60px]"
            >
              <div className="relative">
                <UserPlus size={22} />
              </div>
              <span className="font-medium">Signup</span>
            </Link>
          </>
        )}
      </nav>
    </>
  );
}