import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../utils/api";
import JobCard from "../components/JobCard";
import {
  Search,
  Filter,
  TrendingUp,
  X,
  Sparkles,
  MessageCircleMore,
  Briefcase,
  Users,
  Globe,
  Zap,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import LazyLoadWrapper from "../components/LazyLoadWrapper";

export default function Home({ user }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = Number(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";
  const initialType = searchParams.get("type") || "all";
  const initialSort = searchParams.get("sort") || "latest";

  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [sort, setSort] = useState(initialSort);

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);

  const [supportOpen, setSupportOpen] = useState(false);
  const [supportEmail, setSupportEmail] = useState(user?.email || "");
  const [supportMsg, setSupportMsg] = useState("");
  const [sending, setSending] = useState(false);

  const loader = useRef(null);
  const PAGE_LIMIT = 10;

  const buildParams = (overrides = {}) => {
    const p = {
      page,
      limit: PAGE_LIMIT,
      ...(search ? { search } : {}),
      ...(typeFilter && typeFilter !== "all" ? { type: typeFilter } : {}),
      ...(sort && sort !== "latest" ? { sort } : {}),
      ...overrides,
    };
    Object.keys(p).forEach((k) => {
      if (p[k] === undefined || p[k] === null) delete p[k];
    });
    return p;
  };

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (typeFilter && typeFilter !== "all") params.type = typeFilter;
    if (sort && sort !== "latest") params.sort = sort;
    if (page && page > 1) params.page = String(page);
    setSearchParams(params, { replace: true });
  }, [page, search, typeFilter, sort]);

  const fetchJobs = async (opts = {}) => {
    try {
      const params = buildParams(opts);
      const query = new URLSearchParams(params).toString();
      const res = await API.get(`/jobs?${query}`);

      setTotalJobs(res.data.total || 0);

      setJobs((prev) => {
        if (Number(params.page) === 1) {
          if (res.data.jobs && res.data.jobs.length >= res.data.total) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
          return res.data.jobs;
        }
        const updated = [...prev, ...res.data.jobs];
        if (updated.length >= res.data.total) {
          setHasMore(false);
        }
        return updated;
      });
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page]);

  useEffect(() => {
    setJobs([]);
    setHasMore(true);
    setPage(1);
    fetchJobs({ page: 1 });
  }, [search, typeFilter, sort]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );
    if (loader.current) observer.observe(loader.current);
    return () => loader.current && observer.unobserve(loader.current);
  }, [loader, hasMore]);

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const matchesSearch =
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.company.toLowerCase().includes(search.toLowerCase());
        const matchesType =
          typeFilter === "all" ||
          job.type?.toLowerCase() === typeFilter.toLowerCase();
        const isToday =
          sort === "today" &&
          new Date(job.createdAt).toDateString() === new Date().toDateString();
        return matchesSearch && (sort !== "today" || isToday) && matchesType;
      })
      .sort((a, b) => {
        if (sort === "latest")
          return new Date(b.createdAt) - new Date(a.createdAt);
        if (sort === "oldest")
          return new Date(a.createdAt) - new Date(b.createdAt);
        return 0;
      });
  }, [jobs, search, typeFilter, sort]);

  const structuredData = useMemo(() => {
    const jobPostings = filteredJobs.slice(0, 10).map((job) => ({
      "@type": "JobPosting",
      title: job.title,
      description: job.description || `${job.title} position at ${job.company}`,
      datePosted: job.createdAt,
      hiringOrganization: { "@type": "Organization", name: job.company },
      jobLocation: job.location
        ? { "@type": "Place", address: job.location }
        : undefined,
      employmentType: job.type?.toUpperCase().replace("-", "_"),
    }));
    return {
      "@context": "https://schema.org/",
      "@type": "ItemList",
      itemListElement: jobPostings.map((job, index) => ({
        "@type": "ListItem",
        position: index + 1 + (page - 1) * PAGE_LIMIT,
        item: job,
      })),
    };
  }, [filteredJobs, page]);

  const metaDescription = useMemo(() => {
    let desc = "Find and apply directly to";
    if (typeFilter !== "all") desc += ` ${typeFilter}`;
    desc += " job openings from top companies on JobHuntDirect.";
    if (search) desc += ` Search results for "${search}".`;
    desc +=
      " Discover remote, full-time, and internship roles that match your skills.";
    if (desc.length > 220) desc = desc.slice(0, 217) + "...";
    return desc;
  }, [search, typeFilter]);

  const pageTitle = useMemo(() => {
    let title = "";
    if (search) title += `${search} Jobs | `;
    if (typeFilter !== "all")
      title += `${
        typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)
      } Jobs | `;
    title += "JobHuntDirect - Apply Directly to Top Companies";
    return title;
  }, [search, typeFilter]);

  const makeUrlWithParams = (p) => {
    const params = {
      ...(search ? { search } : {}),
      ...(typeFilter !== "all" ? { type: typeFilter } : {}),
      ...(sort !== "latest" ? { sort } : {}),
      ...(p && p > 1 ? { page: p } : {}),
    };
    const qs = new URLSearchParams(params).toString();
    return `https://jobhuntdirect.jobsearchjob.xyz${qs ? `/?${qs}` : "/"}`;
  };

  const canonicalUrl = makeUrlWithParams(page);
  const prevUrl = page > 1 ? makeUrlWithParams(page - 1) : null;
  const nextUrl = hasMore ? makeUrlWithParams(page + 1) : null;

  const handleClearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setSort("latest");
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportEmail || !supportMsg.trim())
      return alert("Please fill all fields.");
    setSending(true);
    try {
      await API.post("/support", { email: supportEmail, message: supportMsg });
      toast.success("Thank you! Your message has been sent.");
      setSupportMsg("");
      if (!user) setSupportEmail("");
      setSupportOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Helmet htmlAttributes={{ lang: "en" }}>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta
          name="keywords"
          content="job search, jobhuntdirect, job board, remote jobs, tech jobs, software jobs, internships, career"
        />
        <link rel="canonical" href={canonicalUrl} />
        {prevUrl && <link rel="prev" href={prevUrl} />}
        {nextUrl && <link rel="next" href={nextUrl} />}
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta
          property="og:image"
          content="https://jobhuntdirect.jobsearchjob.xyz/preview.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta
          name="twitter:image"
          content="https://jobhuntdirect.jobsearchjob.xyz/preview.png"
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@graph": [
              {
                "@type": "WebSite",
                name: "JobHuntDirect",
                url: "https://jobhuntdirect.jobsearchjob.xyz",
                potentialAction: {
                  "@type": "SearchAction",
                  target:
                    "https://jobhuntdirect.jobsearchjob.xyz/?search={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@type": "Organization",
                name: "JobHuntDirect",
                url: "https://jobhuntdirect.jobsearchjob.xyz",
                logo: "https://jobhuntdirect.jobsearchjob.xyz/logo.png",
              },
              filteredJobs.length > 0 && {
                "@type": "ItemList",
                itemListElement: filteredJobs
                  .slice(0, PAGE_LIMIT)
                  .map((job, index) => ({
                    "@type": "ListItem",
                    position: index + 1 + (page - 1) * PAGE_LIMIT,
                    item: {
                      "@type": "JobPosting",
                      title: job.title,
                      description:
                        job.description ||
                        `${job.title} position at ${job.company}`,
                      datePosted: job.createdAt,
                      hiringOrganization: {
                        "@type": "Organization",
                        name: job.company,
                      },
                      jobLocation: {
                        "@type": "Place",
                        address: job.location || "Remote",
                      },
                      employmentType: job.type?.toUpperCase(),
                    },
                  })),
              },
            ].filter(Boolean),
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 relative overflow-hidden">
        <div
          className="fixed inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-gradient-to-br from-cyan-400/15 via-blue-400/10 to-indigo-400/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 w-[350px] h-[350px] bg-gradient-to-br from-violet-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-3xl" />
        </div>

        <main className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 sm:pb-28">
          {/* Hero Section */}
          <header className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-5 sm:px-4 py-2 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-violet-500/20 rounded-full mb-8 border border-blue-200/50 dark:border-blue-500/30 backdrop-blur-sm shadow-lg shadow-blue-500/5">
              <div className="relative">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="w-4 h-4 text-blue-600/50 dark:text-blue-400/50" />
                </div>
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                Your Career Journey Starts Here
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
              <span className="text-gray-900 dark:text-white">
                Discover Your
              </span>
              <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                  Dream Job
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-blue-500/30 dark:text-blue-400/30"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,7 Q50,0 100,7 T200,7"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-sm sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Explore thousands of opportunities from top companies around the
              world.
              {filteredJobs.length > 0 && (
                <span className="block mt-1 text-blue-600 dark:text-blue-400 font-semibold text-sm sm:text-base">
                  Currently showing {totalJobs} job openings
                </span>
              )}
            </p>
            <div className="flex justify-start sm:justify-center gap-3 overflow-x-auto pb-2 px-1 sm:px-0 -mx-3 sm:mx-0 scrollbar-hide">
              {[
                {
                  icon: Briefcase,
                  label: "Active Jobs",
                  value: "Growing Daily",
                  color: "from-blue-500 to-indigo-500",
                },
                {
                  icon: Users,
                  label: "Companies",
                  value: "Trusted by Employers",
                  color: "from-emerald-500 to-teal-500",
                },
                {
                  icon: Globe,
                  label: "Countries",
                  value: "Worldwide Reach",
                  color: "from-violet-500 to-purple-500",
                },
              ].map((stat, i) => (
                <div key={i} className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/70 dark:bg-slate-800/70 rounded-xl sm:rounded-2xl shadow-md backdrop-blur-xl border border-gray-100/50 dark:border-slate-700/50">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow`}>
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </header>

          {/* Filter Section */}
          <nav aria-label="Job filters" className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Filter className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white">
                    Search & Filters
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    Find the perfect opportunity
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                aria-expanded={filtersOpen}
                aria-controls="filter-section"
                className="px-3 py-2 sm:px-4 rounded-2xl sm:rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                {filtersOpen ? "Hide" : "Show"}
                <ArrowRight
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    filtersOpen ? "rotate-90" : ""
                  }`}
                />
              </button>
            </div>

            {/* Search + Filter Section */}
            {filtersOpen && (
              <div
                id="filter-section"
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-slate-900/50 p-4 sm:p-6 border border-gray-100/80 dark:border-slate-700/50 animate-in slide-in-from-top-4 duration-300"
              >
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="relative flex-1 group">
                    <label htmlFor="job-search" className="sr-only">
                      Search by job title or company name
                    </label>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center transition-all group-focus-within:from-blue-500 group-focus-within:to-indigo-500 group-focus-within:shadow-lg">
                      <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                      id="job-search"
                      type="search"
                      placeholder="Search by job title or company..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-[4.5rem] pr-5 py-4 border-2 border-gray-200 dark:border-slate-600 rounded-2xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 transition-all duration-200 bg-white/50 dark:bg-slate-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base sm:text-lg font-medium"
                    />
                  </div>
                  <div className="relative lg:w-56 group">
                    <label htmlFor="job-type-filter" className="sr-only">
                      Filter by job type
                    </label>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 flex items-center justify-center pointer-events-none transition-all group-focus-within:from-violet-500 group-focus-within:to-purple-500 group-focus-within:shadow-lg">
                      <Briefcase className="w-5 h-5 text-violet-600 dark:text-violet-400 group-focus-within:text-white transition-colors" />
                    </div>
                    <select
                      id="job-type-filter"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full pl-[4.5rem] pr-5 py-4 border-2 border-gray-200 dark:border-slate-600 rounded-2xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 transition-all duration-200 appearance-none bg-white/50 dark:bg-slate-900/50 text-gray-900 dark:text-white cursor-pointer text-base sm:text-lg font-medium"
                    >
                      <option value="all">All Types</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                  <div className="relative lg:w-52 group">
                    <label htmlFor="job-sort" className="sr-only">
                      Sort jobs by date
                    </label>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 flex items-center justify-center pointer-events-none transition-all group-focus-within:from-emerald-500 group-focus-within:to-teal-500 group-focus-within:shadow-lg">
                      <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-focus-within:text-white transition-colors" />
                    </div>
                    <select
                      id="job-sort"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="w-full pl-[4.5rem] pr-5 py-4 border-2 border-gray-200 dark:border-slate-600 rounded-2xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 transition-all duration-200 appearance-none bg-white/50 dark:bg-slate-900/50 text-gray-900 dark:text-white cursor-pointer text-base sm:text-lg font-medium"
                    >
                      <option value="latest">Latest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="today">Posted Today</option>
                    </select>
                  </div>
                  <button
                    onClick={handleClearFilters}
                    aria-label="Clear all filters"
                    className="lg:w-auto px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 text-gray-700 dark:text-gray-200 rounded-2xl font-bold hover:from-gray-200 hover:to-gray-300 dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <X className="w-5 h-5" />
                    <span>Clear</span>
                  </button>
                </div>

                {(search || typeFilter !== "all" || sort !== "latest") && (
                  <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-slate-700/50">
                    <div className="flex flex-wrap gap-3 items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
                        Active Filters:
                      </span>
                      {search && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold border border-blue-200/50 dark:border-blue-500/30 shadow-sm">
                          <Search className="w-3.5 h-3.5" />"{search}"
                        </span>
                      )}
                      {typeFilter !== "all" && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/40 dark:to-purple-900/40 text-violet-700 dark:text-violet-300 rounded-full text-sm font-semibold border border-violet-200/50 dark:border-violet-500/30 shadow-sm">
                          <Briefcase className="w-3.5 h-3.5" />
                          {typeFilter}
                        </span>
                      )}
                      {sort !== "latest" && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-semibold border border-emerald-200/50 dark:border-emerald-500/30 shadow-sm">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {sort}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>
          <section
            aria-live="polite"
            aria-atomic="true"
            className="mb-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600"></div>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 font-medium">
                {filteredJobs.length > 0 ? (
                  <>
                    Found{" "}
                    <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text">
                      {totalJobs}
                    </span>{" "}
                    {filteredJobs.length === 1
                      ? "opportunity"
                      : "opportunities"}
                  </>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    No jobs match your criteria
                  </span>
                )}
              </p>
            </div>
          </section>
          <section aria-label="Job listings">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <article
                    key={job._id}
                    className="group animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                  >
                    <LazyLoadWrapper
                      height="0px"
                      offset={200}
                      placeholder={
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 animate-pulse h-72 w-full rounded-2xl shadow-lg" />
                      }
                    >
                      <div className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-gray-100/80 dark:border-slate-700/50 shadow-lg shadow-gray-200/50 dark:shadow-slate-900/50 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <JobCard job={job} user={user} />
                      </div>
                    </LazyLoadWrapper>
                  </article>
                ))
              ) : (
                <div className="col-span-full">
                  <div className="text-center py-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border-2 border-dashed border-gray-300 dark:border-slate-600 shadow-xl">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl mb-6 shadow-lg">
                      <Search
                        className="w-10 h-10 text-gray-400 dark:text-gray-500"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                      No jobs found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
                      We couldn't find any jobs matching your filters. Try
                      adjusting your search criteria.
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
          {hasMore && (
            <div
              ref={loader}
              className="mt-14 text-center"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="inline-flex items-center gap-4 px-8 py-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-slate-900/50 border border-gray-100/50 dark:border-slate-700/50">
                <div className="flex gap-2" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-bounce shadow-lg shadow-blue-500/50"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
                <span className="text-gray-600 dark:text-gray-400 font-medium text-lg">
                  Loading more opportunities...
                </span>
              </div>
            </div>
          )}
        </main>
        <button
          onClick={() => setSupportOpen(true)}
          aria-label="Open support chat"
          className="fixed sm:bottom-6 bottom-24 right-6 sm:right-2 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group"
        >
          <MessageCircleMore className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse shadow-lg" />
        </button>
        {supportOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-modal-title"
          >
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 opacity-10 dark:opacity-20" />

              <div className="relative p-8">
                <button
                  onClick={() => setSupportOpen(false)}
                  aria-label="Close support modal"
                  className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <MessageCircleMore className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2
                      id="support-modal-title"
                      className="text-xl font-bold text-gray-900 dark:text-white"
                    >
                      Support & Feedback
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      We'd love to hear from you
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSupportSubmit} className="space-y-5">
                  {!user && (
                    <div>
                      <label
                        htmlFor="support-email"
                        className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Your Email
                      </label>
                      <input
                        id="support-email"
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-5 py-3.5 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="support-message"
                      className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="support-message"
                      value={supportMsg}
                      onChange={(e) => setSupportMsg(e.target.value)}
                      placeholder="Describe your issue or suggestion..."
                      className="w-full h-36 px-5 py-3.5 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
