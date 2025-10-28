import { Link } from "react-router-dom";
import API from "../utils/api";
import { MapPin, Calendar, Clock, ExternalLink, Eye, Bookmark, BookmarkCheck, Briefcase } from "lucide-react";

export default function JobCard({ job, onUnsave, onSave, user }) {
  const handleUnsave = async () => {
    if (!onUnsave) return;
    try {
      await API.delete(`/users/unsave/${job._id}`);
      onUnsave(job._id);
    } catch {
      alert("Failed to remove saved job");
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    try {
      await API.post(`/users/save/${job._id}`);
      onSave(job._id);
    } catch {
      alert("Failed to save job");
    }
  };

  // Format date and time properly with labels
  const formattedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Unknown Date";

  const formattedTime = job.createdAt
    ? new Date(job.createdAt).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  // Calculate time ago
  const getTimeAgo = () => {
    if (!job.createdAt) return "";
    const seconds = Math.floor((new Date() - new Date(job.createdAt)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formattedDate;
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:-translate-y-1 flex flex-col h-full">
      
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative p-4 sm:p-5 flex flex-col flex-1">
        
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {job.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium truncate">
              {job.company}
            </p>
          </div>
          
          {/* Time Badge */}
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 whitespace-nowrap">
              {getTimeAgo()}
            </span>
          </div>
        </div>

        {/* Content Section - Grows to fill space */}
        <div className="flex-1">
          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>

          {/* Posted Date & Time Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Always at Bottom */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2">
          
          {/* Details Button */}
          <Link
            to={`/job/${job._id}`}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 text-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Details</span>
          </Link>

          {/* Apply Button */}
          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Apply</span>
          </a>

          {/* Save/Unsave Button - Full Width on Next Row if Exists */}
          {onUnsave && (
            <button
              onClick={handleUnsave}
              className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Remove from Saved</span>
            </button>
          )}

          {!onUnsave && user && (
            <button
              onClick={handleSave}
              className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm"
            >
              <Bookmark className="w-4 h-4" />
              <span>Save Job</span>
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}