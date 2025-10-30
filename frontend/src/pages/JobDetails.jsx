import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import { toast } from "react-toastify";
import { MapPin, Briefcase, Building2, ExternalLink, ArrowLeft, Clock, Users, Calendar, Share2, Bookmark, CheckCircle2, HandCoins } from "lucide-react";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await API.get(`/jobs/${id}`);
        setJob(res.data);
      } catch {
        toast.error("Failed to fetch job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (!job) return;
    const fetchSavedJobs = async () => {
      try {
        const savedRes = await API.get("/users/saved");
        const savedIds = savedRes.data?.map((j) => j._id) || [];
        setIsSaved(savedIds.includes(job._id));
      } catch {}
    };
    fetchSavedJobs();
  }, [job]);

  const handleSaveJob = async () => {
    try {
      if (isSaved) {
        await API.delete(`/users/unsave/${job._id}`);
        toast.info("Job removed from saved list");
      } else {
        await API.post(`/users/save/${job._id}`);
        toast.success("Job saved!");
      }
      setIsSaved(!isSaved);
    } catch {
      toast.error("Failed to update saved jobs");
    }
  };

  const formattedDate = job?.createdAt
    ? new Date(job.createdAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const getTimeAgo = () => {
    if (!job?.createdAt) return "";
    const seconds = Math.floor((new Date() - new Date(job.createdAt)) / 1000);
    if (seconds < 60) return "Just posted";
    if (seconds < 3600) return `Posted ${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `Posted ${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `Posted ${Math.floor(seconds / 86400)} days ago`;
    return `Posted on ${formattedDate}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-32 md:pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" /> Back to Jobs
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 ${loading ? "animate-pulse bg-gray-400/30 rounded h-10 w-3/4" : ""}`}>
                  {!loading && job?.title}
                </h1>
                {!loading && (
                  <div className="flex flex-wrap items-center gap-3 text-blue-100">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      <span className="font-semibold text-lg">{job.company}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                {!loading && (
                  <>
                    <button onClick={handleSaveJob} className={`p-2.5 backdrop-blur-sm rounded-lg transition-all duration-200 ${isSaved ? "bg-yellow-400/30 hover:bg-yellow-500/40" : "bg-white/10 hover:bg-white/20"}`} title={isSaved ? "Unsave Job" : "Save Job"}>
                      <Bookmark className={`w-5 h-5 ${isSaved ? "text-yellow-400 fill-yellow-400" : "text-white"}`} />
                    </button>
                    <button className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-200" title="Share">
                      <Share2 className="w-5 h-5 text-white" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {!loading && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                <Clock className="w-4 h-4 text-blue-100" />
                <span className="text-sm text-blue-100 font-medium">{getTimeAgo()}</span>
              </div>
            )}

            {loading && <div className="h-6 w-1/4 bg-white/20 rounded animate-pulse mt-2"></div>}
          </div>

          {/* Job Info & Description */}
          <div className="p-6 sm:p-8">
            {loading ? (
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ) : (
              <div>
                {/* Job description */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Job Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
