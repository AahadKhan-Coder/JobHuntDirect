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
  Zap,
  Check,
  Sparkles,
  Globe,
  Target,
  Award,
  TrendingUp,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { AuthContext } from "../context/AuthContext";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await API.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (error) {
        toast.error("Failed to fetch job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (!job || !user) return;
    const fetchSavedJobs = async () => {
      try {
        const savedRes = await API.get("/users/saved");
        const savedIds = savedRes.data?.map((j) => j._id) || [];
        setIsSaved(savedIds.includes(job._id));
      } catch (error) {}
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
      toast.error("Failed to update saved jobs");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const formattedDate = job?.createdAt
    ? new Date(job.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })
    : "";

  const getTimeAgo = () => {
    if (!job?.createdAt) return "";
    const seconds = Math.floor((new Date() - new Date(job.createdAt)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formattedDate;
  };

  const getTypeStyles = (type) => {
    const styles = {
      "full-time": { gradient: "from-emerald-500 via-green-500 to-teal-500", bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", light: "bg-emerald-50 dark:bg-emerald-950/50", border: "border-emerald-200 dark:border-emerald-800" },
      "part-time": { gradient: "from-amber-500 via-orange-500 to-yellow-500", bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", light: "bg-amber-50 dark:bg-amber-950/50", border: "border-amber-200 dark:border-amber-800" },
      "contract": { gradient: "from-violet-500 via-purple-500 to-fuchsia-500", bg: "bg-violet-500", text: "text-violet-600 dark:text-violet-400", light: "bg-violet-50 dark:bg-violet-950/50", border: "border-violet-200 dark:border-violet-800" },
      "internship": { gradient: "from-pink-500 via-rose-500 to-red-500", bg: "bg-pink-500", text: "text-pink-600 dark:text-pink-400", light: "bg-pink-50 dark:bg-pink-950/50", border: "border-pink-200 dark:border-pink-800" },
      "remote": { gradient: "from-blue-500 via-indigo-500 to-cyan-500", bg: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", light: "bg-blue-50 dark:bg-blue-950/50", border: "border-blue-200 dark:border-blue-800" },
    };
    return styles[type?.toLowerCase()] || styles["full-time"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 flex items-center justify-center relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="relative text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
            <div className="absolute inset-0.5 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/50 to-red-100/30 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/20 flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-rose-400/20 rounded-full blur-3xl" />
        </div>
        <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-white/50 dark:border-slate-700/50">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-900/30 dark:to-red-900/30 rounded-2xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">😞</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Job Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">The position you're looking for may have been filled or removed.</p>
          <button onClick={() => navigate("/")} className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 active:scale-100 inline-flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Browse All Jobs
          </button>
        </div>
      </div>
    );
  }

  const typeStyles = getTypeStyles(job.type);

  return (
    <>
      <Helmet>
        <title>{job.title} at {job.company} in {job.location || "India"} | JobHuntDirect</title>
        <meta name="description" content={`Apply for ${job.title} at ${job.company} in ${job.location}. View details and apply directly.`} />
        <link rel="canonical" href={`https://jobhuntdirect.jobsearchjob.xyz/jobs/${job._id}`} />
        <meta property="og:title" content={`${job.title} – ${job.company} | JobHuntDirect`} />
        <meta property="og:description" content={`Apply for ${job.title} at ${job.company} in ${job.location}.`} />
        <meta property="og:url" content={`https://jobhuntdirect.jobsearchjob.xyz/jobs/${job._id}`} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="JobHuntDirect" />
        <meta property="og:image" content="https://jobhuntdirect.jobsearchjob.xyz/default-job-banner.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${job.title} – ${job.company}`} />
        <meta name="twitter:description" content={`Apply for ${job.title} at ${job.company}.`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "JobPosting",
            title: job.title,
            description: job.description,
            hiringOrganization: { "@type": "Organization", name: job.company },
            jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.location || "India", addressCountry: "IN" } },
            datePosted: job.createdAt,
            employmentType: job.type || "Full-time",
            baseSalary: job.salary ? { "@type": "MonetaryAmount", currency: "INR", value: { "@type": "QuantitativeValue", value: job.salary, unitText: "YEAR" } } : undefined,
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 pb-40 md:pb-32 relative">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/15 via-indigo-400/10 to-violet-400/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/10 via-blue-400/10 to-indigo-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 w-[400px] h-[400px] bg-gradient-to-br from-violet-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate(-1)} className="group flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-slate-700/50 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back to Jobs</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button onClick={user ? handleSaveJob : () => toast.info("Please log in to save jobs")} className={`group relative w-10 h-10 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 ${isSaved ? "bg-gradient-to-br from-yellow-400 to-amber-500" : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50"}`}>
                <Bookmark className={`w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all ${isSaved ? "text-white fill-white" : "text-gray-600 dark:text-gray-400 group-hover:text-yellow-500"}`} />
              </button>
              <button onClick={handleShare} className="group relative w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105">
                {copied ? <Check className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-500" /> : <Share2 className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />}
              </button>
            </div>
          </div>

          {/* Hero Card */}
          <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 shadow-2xl">
            {/* Gradient Header */}
            <div className={`relative h-36 sm:h-40 bg-gradient-to-br ${typeStyles.gradient} overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              {/* Floating Elements */}
              <div className="absolute top-6 right-6 w-20 h-20 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
              
              {/* Time Badge */}
              <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white text-sm font-semibold">{getTimeAgo()}</span>
              </div>
              
              {/* Type Badge */}
              <div className="absolute top-6 right-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                <span className="text-white text-sm font-bold capitalize">{job.type}</span>
              </div>
            </div>

            {/* Company Logo & Info */}
            <div className="relative px-6 sm:px-10 pb-8">
              {/* Company Avatar */}
              <div className="absolute -top-12 left-6 sm:left-10">
                <div className="relative">
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${typeStyles.gradient} p-1 shadow-2xl`}>
                    <div className="w-full h-full rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center">
                      <Building2 className={`w-10 h-10 ${typeStyles.text}`} />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="pt-16">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`text-lg font-bold ${typeStyles.text}`}>{job.company}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 text-xs sm:text-base">
                    <MapPin className="w-4 h-4" />
                    {job.location || "Remote"}
                  </span>
                </div>
                
                <h1 className="text-base sm:text-4xl lg:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-6">
                  {job.title}
                </h1>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: Calendar, label: formattedDate },
                    job.salary && { icon: HandCoins, label: job.salary },
                    job.experience && { icon: TrendingUp, label: job.experience },
                  ].filter(Boolean).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 bg-gray-100/80 dark:bg-slate-700/50 rounded-xl text-gray-700 dark:text-gray-300 font-medium">
                      <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs sm:text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: MapPin, label: "Location", value: job.location || "Remote", gradient: "from-blue-500 to-cyan-500" },
              { icon: Briefcase, label: "Employment", value: job.type, gradient: "from-violet-500 to-purple-500", capitalize: true },
              { icon: HandCoins, label: "Compensation", value: job.salary || "Competitive", gradient: "from-emerald-500 to-green-500" },
              { icon: Users, label: "Experience", value: job.experience || "Open to all", gradient: "from-orange-500 to-amber-500" },
            ].map((item, i) => (
              <div key={i} className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 border border-gray-100/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                <p className={`text-gray-900 dark:text-white font-bold text-xs sm:text-sm ${item.capitalize ? "capitalize" : ""} truncate`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Description Card */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-[2rem] border border-white/50 dark:border-slate-700/50 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white">About This Role</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Everything you need to know</p>
                </div>
              </div>
              
              <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-base sm:text-lg">{job.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Apply Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-gray-200/50 dark:border-slate-700/50 shadow-2xl">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
              <div className="flex items-center gap-4">
                <div className="hidden sm:block flex-1">
                  <p className="text-gray-900 dark:text-white font-bold text-lg truncate">{job.title}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{job.company} • {job.location}</p>
                </div>
                <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="group flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                  <Zap className="w-5 h-5" />
                  <span>Apply Now</span>
                  <ExternalLink className="w-5 h-5 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}