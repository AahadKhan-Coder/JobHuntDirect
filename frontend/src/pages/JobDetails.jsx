import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import { toast } from "react-toastify";
import {
  MapPin,
  Briefcase,
  Building2,
  ExternalLink,
  ArrowLeft,
  Clock,
  Users,
  Calendar,
  Share2,
  Bookmark,
  CheckCircle2,
  Loader2,
  HandCoins,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { AuthContext } from "../context/AuthContext";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const {user} = useContext(AuthContext);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await API.get(`/jobs/${id}`);
        setJob(res.data);

        // const savedRes = await API.get("/users/saved");
        // const savedIds = savedRes.data?.map((j) => j._id) || [];
        // setIsSaved(savedIds.includes(res.data._id));
      } catch (error) {
        toast.error("Failed to fetch job details");
        // console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // Fetch saved jobs status
  useEffect(() => {
    if (!job || !user) return;

    const fetchSavedJobs = async () => {
      try {
        const savedRes = await API.get("/users/saved");
        const savedIds = savedRes.data?.map((j) => j._id) || [];
        setIsSaved(savedIds.includes(job._id));
      } catch (error) {
        // console.warn("Failed to fetch saved jobs", error); // do not toast
      }
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
    } catch (error) {
      // console.error(error);
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
    if (seconds < 86400)
      return `Posted ${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800)
      return `Posted ${Math.floor(seconds / 86400)} days ago`;
    return `Posted on ${formattedDate}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading job details...
          </p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😞</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Job Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${job.title} Job Details in ${job.location || "Bangalore"} | Apply Now | JobHuntDirect`}</title>
        <meta
          name="description"
          content={`Explore ${job.title} job details for freshers and experienced professionals in ${job.location || "Bangalore"}. Apply directly to top companies through JobHuntDirect and discover more ${job.type || "full-time"} jobs.`}
        />
        <link
          rel="canonical"
          href={`https://jobhuntdirect.jobsearchjob.xyz/jobs/${job._id}`}
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-32 md:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Jobs
          </button>

          {/* Main Content Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3">
                    {job.title} - {job.company} - {job.location || "Bangalore"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-blue-100">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      <span className="font-semibold text-lg">
                        {job.company}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={ user ? handleSaveJob : () => toast.info("Please log in to save jobs")}
                    className={`p-2.5 backdrop-blur-sm rounded-lg transition-all duration-200 ${
                      isSaved
                        ? "bg-yellow-400/30 hover:bg-yellow-500/40"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                    title={isSaved ? "Unsave Job" : "Save Job"}
                  >
                    <Bookmark
                      className={`w-5 h-5 ${
                        isSaved
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-white"
                      }`}
                    />
                  </button>
                  <button
                    className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-200"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Time Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                <Clock className="w-4 h-4 text-blue-100" />
                <span className="text-sm text-blue-100 font-medium">
                  {getTimeAgo()}
                </span>
              </div>
            </div>

            {/* Job Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700">
              {/* Location */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                    Location
                  </p>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {job.location}
                  </p>
                </div>
              </div>

              {/* Job Type */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                    Job Type
                  </p>
                  <p className="text-gray-900 dark:text-white font-semibold capitalize">
                    {job.type}
                  </p>
                </div>
              </div>

              {/* Posted Date */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                    Posted On
                  </p>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {formattedDate}
                  </p>
                </div>
              </div>

              {/* Salary */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <HandCoins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                    Salary
                  </p>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {job.salary}
                  </p>
                </div>
              </div>

              {/* Experience */}
              {job.experience && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                    <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                      Experience
                    </p>
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {job.experience}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Job Description
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            </div>
          </div>

          {/* Fixed Apply Button */}
          <div className="fixed bottom-20 lg:bottom-6 left-0 right-0 px-4 sm:px-6 z-40">
            <div className="max-w-4xl mx-auto">
              <a
                href={job.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                <ExternalLink className="w-6 h-6" />
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}