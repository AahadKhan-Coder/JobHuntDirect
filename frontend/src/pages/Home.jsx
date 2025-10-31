import { useEffect, useState, useRef, useMemo } from "react";
import API from "../utils/api";
import JobCard from "../components/JobCard";
import {
  Search,
  Filter,
  TrendingUp,
  X,
  Sparkles,
  MessageCircleMore,
} from "lucide-react";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import LazyLoadWrapper from "../components/LazyLoadWrapper";

export default function Home({ user }) {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState("latest");

  const [filtersOpen, setFiltersOpen] = useState(true);

  const [supportOpen, setSupportOpen] = useState(false);
  const [supportEmail, setSupportEmail] = useState(user?.email || "");
  const [supportMsg, setSupportMsg] = useState("");
  const [sending, setSending] = useState(false);

  const loader = useRef(null);

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      const res = await API.get(`/jobs?page=${page}&limit=10`);
      setJobs((prev) => [...prev, ...res.data.jobs]);
      if (jobs.length + res.data.jobs.length >= res.data.total) setHasMore(false);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) setPage((prev) => prev + 1);
      },
      { threshold: 1 }
    );

    if (loader.current) observer.observe(loader.current);
    return () => loader.current && observer.unobserve(loader.current);
  }, [loader, hasMore]);

  // Memoized filtered jobs for performance
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

  // Generate dynamic structured data for search engines
  const structuredData = useMemo(() => {
    const jobPostings = filteredJobs.slice(0, 10).map((job) => ({
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description || `${job.title} position at ${job.company}`,
      "datePosted": job.createdAt,
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.company,
      },
      "jobLocation": job.location ? {
        "@type": "Place",
        "address": job.location
      } : undefined,
      "employmentType": job.type?.toUpperCase().replace("-", "_"),
    }));

    return {
      "@context": "https://schema.org/",
      "@type": "ItemList",
      "itemListElement": jobPostings.map((job, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": job
      }))
    };
  }, [filteredJobs]);

  // Dynamic meta description based on filters
  const metaDescription = useMemo(() => {
    let desc = "Find and apply directly to";
    if (typeFilter !== "all") desc += ` ${typeFilter}`;
    desc += " job openings from top companies on JobHuntDirect.";
    if (search) desc += ` Search results for "${search}".`;
    desc += " Discover remote, full-time, and internship roles that match your skills.";
    return desc;
  }, [search, typeFilter]);

  // Dynamic title based on filters
  const pageTitle = useMemo(() => {
    let title = "";
    if (search) title += `${search} Jobs | `;
    if (typeFilter !== "all") title += `${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)} Jobs | `;
    title += "JobHuntDirect - Apply Directly to Top Companies";
    return title;
  }, [search, typeFilter]);

  // Clear all filters
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
      await API.post("/support", {
        email: supportEmail,
        message: supportMsg,
      });
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
      <Helmet>
        {/* Dynamic SEO Title */}
        <title>{pageTitle}</title>
        
        {/* Dynamic Meta Description */}
        <meta name="description" content={metaDescription} />
        
        {/* Enhanced Keywords */}
        <meta
          name="keywords"
          content="job search, jobhuntdirect, job board, remote jobs, tech jobs, software jobs, internships, career, employment, full-time jobs, part-time jobs, contract work, job listings, job opportunities, career development, job application, direct application, company jobs, hiring, recruitment"
        />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://jobhuntdirect.jobsearchjob.xyz" />
        
        {/* Language */}
        <html lang="en" />
        
        {/* Robots Meta */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* Author */}
        <meta name="author" content="JobHuntDirect" />
        
        {/* Open Graph - Enhanced */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="JobHuntDirect" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content="https://jobhuntdirect.jobsearchjob.xyz" />
        <meta property="og:image" content="https://jobhuntdirect.jobsearchjob.xyz/preview.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="JobHuntDirect - Find Your Dream Job" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card - Enhanced */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content="https://jobhuntdirect.jobsearchjob.xyz/preview.png" />
        <meta name="twitter:image:alt" content="JobHuntDirect Job Search Platform" />
        <meta name="twitter:site" content="@jobhuntdirect" />
        <meta name="twitter:creator" content="@jobhuntdirect" />

        {/* Additional Meta Tags for Better Indexing */}
        <meta name="application-name" content="JobHuntDirect" />
        <meta name="apple-mobile-web-app-title" content="JobHuntDirect" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* WebSite Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "WebSite",
            "name": "JobHuntDirect",
            "alternateName": "Job Hunt Direct",
            "url": "https://jobhuntdirect.jobsearchjob.xyz",
            "description": "Find and apply directly to job openings from top companies worldwide",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://jobhuntdirect.jobsearchjob.xyz/?search={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>

        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "JobHuntDirect",
            "url": "https://jobhuntdirect.jobsearchjob.xyz",
            "logo": "https://jobhuntdirect.jobsearchjob.xyz/logo.png",
            "description": "Job search platform connecting job seekers with top companies",
            "foundingDate": "2024",
            "sameAs": [
              "https://twitter.com/jobhuntdirect",
              "https://linkedin.com/company/jobhuntdirect"
            ]
          })}
        </script>

        {/* BreadcrumbList Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://jobhuntdirect.jobsearchjob.xyz"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Jobs",
                "item": "https://jobhuntdirect.jobsearchjob.xyz"
              }
            ]
          })}
        </script>

        {/* JobPosting List Schema - Dynamic */}
        {filteredJobs.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
      </Helmet>

      <div className="min-h-screen bg-transparent">
        {/* Main Content with Semantic HTML */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
          {/* Hero Section with H1 */}
          <header className="text-center mb-12 animate-fadeIn">
            <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900 rounded-full mb-4" aria-hidden="true">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-bounce" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Discover Your Dream Job
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Explore thousands of opportunities from top companies around the world. 
              {filteredJobs.length > 0 && ` Currently showing ${filteredJobs.length} job openings.`}
            </p>
          </header>

          {/* Filter Section with Semantic Navigation */}
          <nav aria-label="Job filters" className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Filter className="w-5 h-5" aria-hidden="true" />
                Filters
              </h2>
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                aria-expanded={filtersOpen}
                aria-controls="filter-section"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200"
              >
                {filtersOpen ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            {/* Search + Filter Section */}
            {filtersOpen && (
              <div id="filter-section" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <label htmlFor="job-search" className="sr-only">
                      Search by job title or company name
                    </label>
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <input
                      id="job-search"
                      type="search"
                      placeholder="Search by job title or company name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-label="Search jobs"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl 
                             focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 
                             dark:focus:ring-blue-900 transition-all duration-200
                             bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                             placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>

                  {/* Filter by Type */}
                  <div className="relative lg:w-56">
                    <label htmlFor="job-type-filter" className="sr-only">
                      Filter by job type
                    </label>
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden="true" />
                    <select
                      id="job-type-filter"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      aria-label="Job type filter"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                             focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100
                             dark:focus:ring-blue-900 transition-all duration-200 appearance-none
                             bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white cursor-pointer"
                    >
                      <option value="all">All Job Types</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>

                  {/* Sort by Date */}
                  <div className="relative lg:w-48">
                    <label htmlFor="job-sort" className="sr-only">
                      Sort jobs by date
                    </label>
                    <TrendingUp className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden="true" />
                    <select
                      id="job-sort"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      aria-label="Sort jobs"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                             focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100
                             dark:focus:ring-blue-900 transition-all duration-200 appearance-none
                             bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white cursor-pointer"
                    >
                      <option value="latest">Latest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="today">Posted Today</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <button
                    onClick={handleClearFilters}
                    aria-label="Clear all filters"
                    className="lg:w-auto px-6 py-3.5 bg-gradient-to-r from-gray-100 to-gray-200 
                           dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-100 
                           rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 
                           dark:hover:from-gray-600 dark:hover:to-gray-500 
                           transition-all duration-200 flex items-center justify-center gap-2
                           shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                    <span>Clear</span>
                  </button>
                </div>

                {/* Active Filters Indicator */}
                {(search || typeFilter !== "all" || sort !== "latest") && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Active filters:
                      </span>
                      {search && (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                          Search: "{search}"
                        </span>
                      )}
                      {typeFilter !== "all" && (
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                          Type: {typeFilter}
                        </span>
                      )}
                      {sort !== "latest" && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                          Sort: {sort}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Results Count with Semantic Markup */}
          <section aria-live="polite" aria-atomic="true" className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {filteredJobs.length > 0 ? (
                <>
                  Found{" "}
                  <strong className="text-blue-600 dark:text-blue-400">
                    {filteredJobs.length}
                  </strong>{" "}
                  {filteredJobs.length === 1 ? "job" : "jobs"}
                </>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">
                  No jobs match your search criteria
                </span>
              )}
            </p>
          </section>

          {/* Job List Grid with Semantic Article Tags */}
          <section aria-label="Job listings">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) =>
                  index < 9 ? (
                    <article key={job._id}>
                      <JobCard job={job} user={user} />
                    </article>
                  ) : (
                    <article key={job._id}>
                      <LazyLoadWrapper height="360px" offset={300} placeholder={<div className="bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse h-full w-full" />}>
                        <div className="transition-opacity duration-300 opacity-0 lazyloaded:opacity-100">
                          <JobCard job={job} user={user} />
                        </div>
                      </LazyLoadWrapper>
                    </article>
                  )
                )
              ) : (
                <div className="col-span-full">
                  <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                      <Search className="w-8 h-8 text-gray-400" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No jobs found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      We couldn't find any jobs matching your filters. Try
                      adjusting your search criteria.
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors duration-200"
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Infinite Scroll Loader */}
          {hasMore && (
            <div ref={loader} className="mt-12 text-center" aria-live="polite" aria-busy="true">
              <div className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-gray-800 rounded-full shadow-lg">
                <div className="flex space-x-2" aria-hidden="true">
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Loading more amazing opportunities...
                </span>
              </div>
            </div>
          )}
        </main>

        {/* Floating Support Button */}
        <button
          onClick={() => setSupportOpen(true)}
          aria-label="Open support chat"
          className="fixed bottom-20 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110"
        >
          <MessageCircleMore aria-hidden="true" />
        </button>

        {/* Support Modal */}
        {supportOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-modal-title"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative m-4 md:m-0">
              <button
                onClick={() => setSupportOpen(false)}
                aria-label="Close support modal"
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                ✖
              </button>
              <h2 id="support-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Support / Suggestions
              </h2>
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                {!user && (
                  <div>
                    <label htmlFor="support-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Email
                    </label>
                    <input
                      id="support-email"
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="Enter your email..."
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="support-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    id="support-message"
                    value={supportMsg}
                    onChange={(e) => setSupportMsg(e.target.value)}
                    placeholder="Describe your issue or suggestion..."
                    className="w-full h-32 px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-70"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}