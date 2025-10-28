import { useState, useEffect } from "react";
import API from "../utils/api";
import { toast } from "react-toastify";
import {
  Search,
  TrendingUp,
  Edit3,
  Trash2,
  X,
  Save,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [editJobId, setEditJobId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    description: "",
    applyLink: "",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await API.get("/jobs");
      setJobs(res.data.jobs || res.data);
    } catch {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs
    .filter(
      (job) =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "latest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  const handleEdit = (job) => {
    setEditJobId(job._id);
    setForm({ ...job });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/jobs/${editJobId}`, form);
      setEditJobId(null);
      fetchJobs();
      toast.success("Job updated successfully!");
    } catch {
      toast.error("Failed to update job");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/jobs/${id}`);
      fetchJobs();
      toast.info("Job deleted");
    } catch {
      toast.error("Failed to delete job");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Manage Jobs
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-16">
            Edit, update, or remove job postings
          </p>
        </div>

        {/* Search & Sort Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                placeholder="Search by job title or company name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                         focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100
                         dark:focus:ring-blue-900 transition-all duration-200
                         bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative md:w-56">
              <TrendingUp className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                         focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100
                         dark:focus:ring-blue-900 transition-all duration-200 appearance-none
                         bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white cursor-pointer"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {filteredJobs.length}
              </span>{" "}
              of <span className="font-bold">{jobs.length}</span> jobs
            </p>
          </div>
        </div>

        {/* Edit Form Modal */}
        {editJobId && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8 border-2 border-blue-500 dark:border-blue-400">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Edit Job Posting
              </h2>
              <button
                onClick={() => setEditJobId(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Job Title
                </label>
                <input
                  placeholder="e.g. Senior React Developer"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100
                           dark:focus:ring-blue-900 transition-all duration-200
                           bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  placeholder="e.g. Google"
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100
                           dark:focus:ring-blue-900 transition-all duration-200
                           bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              {/* Location & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    placeholder="e.g. San Francisco, CA"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                             focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100
                             dark:focus:ring-blue-900 transition-all duration-200
                             bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Job Type
                  </label>
                  <input
                    placeholder="e.g. Full-time"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                             focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100
                             dark:focus:ring-blue-900 transition-all duration-200
                             bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Job Description
                </label>
                <textarea
                  placeholder="Detailed job description..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100
                           dark:focus:ring-blue-900 transition-all duration-200
                           bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                />
              </div>
              {/* Salary */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Salary
                </label>
                <input
                  placeholder="e.g. $80,000 - $100,000"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl
             focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100
             dark:focus:ring-blue-900 transition-all duration-200
             bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              {/* Apply Link */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Application Link
                </label>
                <input
                  placeholder="https://..."
                  value={form.applyLink}
                  onChange={(e) =>
                    setForm({ ...form, applyLink: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100
                           dark:focus:ring-blue-900 transition-all duration-200
                           bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdate}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Save className="w-5 h-5" />
                  Update Job
                </button>
                <button
                  onClick={() => setEditJobId(null)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-semibold transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading jobs...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Company
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Date Posted
                      </th>
                      <th className="px-6 py-4 text-center font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredJobs.length > 0 ? (
                      filteredJobs.map((job) => (
                        <tr
                          key={job._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {job.title}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                            {job.company}
                          </td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                            {job.location}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              {job.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(job)}
                                className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(job._id)}
                                className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400 font-medium">
                            No jobs found
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Try adjusting your search filters
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {job.company}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 whitespace-nowrap ml-2">
                        {job.type}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleEdit(job)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-2">
                    No jobs found
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Try adjusting your search filters
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
