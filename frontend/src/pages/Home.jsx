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
} from "lucide-react";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import LazyLoadWrapper from "../components/LazyLoadWrapper";

export default function Home({ user }) {
  // Read URL search params
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL (fallbacks)
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

  const [supportOpen, setSupportOpen] = useState(false);
  const [supportEmail, setSupportEmail] = useState(user?.email || "");
  const [supportMsg, setSupportMsg] = useState("");
  const [sending, setSending] = useState(false);

  const loader = useRef(null);
  const PAGE_LIMIT = 10;

  // Build a params object to keep URL and API in sync
  const buildParams = (overrides = {}) => {
    const p = {
      page,
      limit: PAGE_LIMIT,
      ...(search ? { search } : {}),
      ...(typeFilter && typeFilter !== "all" ? { type: typeFilter } : {}),
      ...(sort && sort !== "latest" ? { sort } : {}),
      ...overrides,
    };

    // remove undefined/null values
    Object.keys(p).forEach((k) => {
      if (p[k] === undefined || p[k] === null) delete p[k];
    });

    return p;
  };

  // update URL query params whenever page/search/typeFilter/sort change
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (typeFilter && typeFilter !== "all") params.type = typeFilter;
    if (sort && sort !== "latest") params.sort = sort;
    if (page && page > 1) params.page = String(page);

    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, typeFilter, sort]);

  // Fetch jobs from API (respects search/type/page/sort)
  const fetchJobs = async (opts = {}) => {
    try {
      const params = buildParams(opts);
      // build query string
      const query = new URLSearchParams(params).toString();
      const res = await API.get(`/jobs?${query}`);

      setJobs((prev) => {
        // if page === 1, replace (we want fresh results when filters/search change)
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

  // Initial & page-based fetch
  useEffect(() => {
    // When page changes, fetch that page
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // When filters/search/sort change -> reset to page 1 and fetch fresh
  useEffect(() => {
    // Reset job list and pagination
    setJobs([]);
    setHasMore(true);
    setPage(1); // this will trigger fetchJobs via page effect
    // We explicitly fetch page=1 with new params to avoid race (optional)
    fetchJobs({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter, sort]);

  // Infinite scroll observer (unchanged UX)
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

  // Memoized filtered jobs for UI (you still filter client-side for instant feedback)
  // NOTE: Because API already supports search/type/sort, this client filtering is optional.
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

  // Generate dynamic structured data for search engines (ItemList)
  const structuredData = useMemo(() => {
    const jobPostings = filteredJobs.slice(0, 10).map((job) => ({
      "@type": "JobPosting",
      title: job.title,
      description: job.description || `${job.title} position at ${job.company}`,
      datePosted: job.createdAt,
      hiringOrganization: {
        "@type": "Organization",
        name: job.company,
      },
      jobLocation: job.location
        ? {
            "@type": "Place",
            address: job.location,
          }
        : undefined,
      employmentType: job.type?.toUpperCase().replace("-", "_"),
    }));

    return {
      "@context": "https://schema.org/",
      "@type": "ItemList",
      itemListElement: jobPostings.map((job, index) => ({
        "@type": "ListItem",
        position: index + 1 + (page - 1) * PAGE_LIMIT, // reflect absolute position across pages
        item: job,
      })),
    };
  }, [filteredJobs, page]);

  // Dynamic meta description based on filters
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

  // Dynamic title based on filters
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

  // Create canonical & prev/next URLs
  const makeUrlWithParams = (p) => {
    const params = { ...(search ? { search } : {}), ...(typeFilter !== "all" ? { type: typeFilter } : {}), ...(sort !== "latest" ? { sort } : {}), ...(p && p > 1 ? { page: p } : {}) };
    const qs = new URLSearchParams(params).toString();
    return `https://jobhuntdirect.jobsearchjob.xyz${qs ? `/?${qs}` : "/"}`;
  };

  const canonicalUrl = makeUrlWithParams(page);
  const prevUrl = page > 1 ? makeUrlWithParams(page - 1) : null;
  const nextUrl = hasMore ? makeUrlWithParams(page + 1) : null;

  // Clear all filters
  const handleClearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setSort("latest");
    // setPage(1) is handled by effect that observes search/type/sort
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
      <Helmet htmlAttributes={{ lang: "en" }}>
        {/* Dynamic Title */}
        <title>{pageTitle}</title>

        {/* Dynamic Meta Description */}
        <meta name="description" content={metaDescription} />

        {/* Keywords */}
        <meta
          name="keywords"
          content="job search, jobhuntdirect, job board, remote jobs, tech jobs, software jobs, internships, career"
        />

        {/* Canonical */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Pagination Links for Crawlers */}
        {prevUrl && <link rel="prev" href={prevUrl} />}
        {nextUrl && <link rel="next" href={nextUrl} />}

        {/* Robots */}
        <meta name="robots" content="index, follow" />

        {/* OG Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta
          property="og:image"
          content="https://jobhuntdirect.jobsearchjob.xyz/preview.png"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta
          name="twitter:image"
          content="https://jobhuntdirect.jobsearchjob.xyz/preview.png"
        />

        {/* Combined JSON-LD Schema */}
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

      {/* ... rest of your JSX unchanged (hero, filters, results, job grid, loader, support button/modal) ... */}

      <div className="min-h-screen bg-transparent">
        {/* Main Content with Semantic HTML */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
          {/* Hero Section with H1 */}
          <header className="text-center mb-12 animate-fadeIn">
            <div
              className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900 rounded-full mb-4"
              aria-hidden="true"
            >
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-bounce" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Discover Your Dream Job
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Explore thousands of opportunities from top companies around the
              world.
              {filteredJobs.length > 0 &&
                ` Currently showing ${filteredJobs.length} job openings.`}
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
              <div
                id="filter-section"
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <label htmlFor="job-search" className="sr-only">
                      Search by job title or company name
                    </label>
                    <Search
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                      aria-hidden="true"
                    />
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
                    <Filter
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                      aria-hidden="true"
                    />
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
                    <TrendingUp
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                      aria-hidden="true"
                    />
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
                filteredJobs.map((job) => (
                  <article key={job._id}>
                    <LazyLoadWrapper
                      height="0px"
                      offset={200}
                      placeholder={
                        <div className="bg-gray-100 dark:bg-gray-800 animate-pulse h-full w-full rounded-2xl" />
                      }
                    >
                      <JobCard job={job} user={user} />
                    </LazyLoadWrapper>
                  </article>
                ))
              ) : (
                <div className="col-span-full">
                  <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                      <Search
                        className="w-8 h-8 text-gray-400"
                        aria-hidden="true"
                      />
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
            <div
              ref={loader}
              className="mt-12 text-center"
              aria-live="polite"
              aria-busy="true"
            >
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
              <h2
                id="support-modal-title"
                className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4"
              >
                Support / Suggestions
              </h2>
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                {!user && (
                  <div>
                    <label
                      htmlFor="support-email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
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
                  <label
                    htmlFor="support-message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
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
