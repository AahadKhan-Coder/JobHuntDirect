import { Link } from "react-router-dom";
import API from "../utils/api";

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
        hour12: true, // ✅ 12-hour format with AM/PM
      })
    : "";

  return (
    <div className="flex justify-between items-center border dark:border-gray-700 rounded-lg px-3 py-2 mb-2 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition">
      {/* --- Job Info (Left Side) --- */}
      <div className="flex flex-col w-2/3 overflow-hidden">
        <h2 className="font-medium text-sm md:text-base truncate">
          {job.title}
        </h2>
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 truncate">
          {job.company}
        </p>
        <p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 truncate">
          {job.location}
        </p>

        {/* --- Posted Date & Time --- */}
        <p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span className="font-medium">Posted on:</span> {formattedDate}{" "}
          <span className="text-gray-400">at</span> {formattedTime}
        </p>
      </div>

      {/* --- Action Buttons (Right Side) --- */}
      <div className="flex gap-2 shrink-0 ml-2">
        <Link
          to={`/job/${job._id}`}
          className="bg-gray-500 text-white text-xs md:text-sm px-2 md:px-3 py-1 rounded hover:bg-gray-600 transition whitespace-nowrap"
        >
          Details
        </Link>

        <a
          href={job.applyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 text-white text-xs md:text-sm px-2 md:px-3 py-1 rounded hover:bg-blue-600 transition whitespace-nowrap"
          style={{ zIndex: 10 }}
        >
          Apply
        </a>

        {onUnsave && (
          <button
            onClick={handleUnsave}
            className="hidden md:inline-block bg-red-500 text-white text-xs md:text-sm px-2 md:px-3 py-1 rounded hover:bg-red-600 transition whitespace-nowrap"
          >
            Unsave
          </button>
        )}

        {!onUnsave && user && (
          <button
            onClick={handleSave}
            className="hidden md:inline-block bg-green-500 text-white text-xs md:text-sm px-2 md:px-3 py-1 rounded hover:bg-green-600 transition whitespace-nowrap"
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
}
