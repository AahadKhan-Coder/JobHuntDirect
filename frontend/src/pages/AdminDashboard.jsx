import { useState, useEffect } from "react";
import API from "../utils/api";
import { toast } from "react-toastify";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  FileText,
  ExternalLink,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    salary: "",
    description: "",
    applyLink: "",
  });
  const [editJobId, setEditJobId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await API.get("/jobs");
      setJobs(res.data.jobs || res.data);
    } catch (error) {
      toast.error("Failed to fetch jobs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      company: "",
      location: "",
      type: "",
      salary: "",
      description: "",
      applyLink: "",
    });
    setEditJobId(null);
  };

  const handleCreate = async () => {
    const { title, company, location, type, description, applyLink, salary } = form;
    if ([title, company, location, type, description, applyLink, salary].some(v => !v.trim())) {
      return toast.error("All fields are required");
    }

    try {
      await API.post("/jobs", form);
      toast.success("Job created successfully!");
      resetForm();
      fetchJobs();
    } catch (error) {
      toast.error("Failed to create job");
      console.error(error);
    }
  };

  const handleEdit = (job) => {
    setEditJobId(job._id);
    setForm({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary || "",
      description: job.description,
      applyLink: job.applyLink,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async () => {
    const { title, company, location, type, description, applyLink, salary } = form;
    if ([title, company, location, type, description, applyLink, salary].some(v => !v.trim())) {
      return toast.error("All fields are required");
    }

    try {
      await API.put(`/jobs/${editJobId}`, form);
      toast.success("Job updated successfully!");
      resetForm();
      fetchJobs();
    } catch (error) {
      toast.error("Failed to update job");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await API.delete(`/jobs/${id}`);
      toast.info("Job deleted");
      fetchJobs();
    } catch (error) {
      toast.error("Failed to delete job");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-16">
            Create and manage job postings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{jobs.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Recent Posts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {jobs.filter(job => {
                    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    return new Date(job.createdAt) > dayAgo;
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Status</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">Active</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Job Form */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8 ${editJobId ? 'border-2 border-yellow-500 dark:border-yellow-400' : 'border border-gray-200 dark:border-gray-700'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {editJobId ? (
                <>
                  <Edit3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  Edit Job Posting
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6 text-green-600 dark:text-green-400" />
                  Create New Job
                </>
              )}
            </h2>
            {editJobId && (
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            )}
          </div>

          <div className="space-y-5">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Job Title
              </label>
              <input
                placeholder="e.g. Senior React Developer"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                         focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100
                         dark:focus:ring-purple-900 transition-all duration-200
                         bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Company Name
              </label>
              <input
                placeholder="e.g. Google"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                         focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100
                         dark:focus:ring-purple-900 transition-all duration-200
                         bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Location & Type Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <input
                  placeholder="e.g. San Francisco, CA"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100
                           dark:focus:ring-purple-900 transition-all duration-200
                           bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Job Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100
                           dark:focus:ring-purple-900 transition-all duration-200 appearance-none
                           bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white cursor-pointer"
                >
                  <option value="">Select Job Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Salary
              </label>
              <input
                placeholder="e.g. $60,000 - $80,000 / year"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                         focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100
                         dark:focus:ring-purple-900 transition-all duration-200
                         bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Job Description
              </label>
              <textarea
                placeholder="Detailed job description, requirements, and responsibilities..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                         focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100
                         dark:focus:ring-purple-900 transition-all duration-200
                         bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              />
            </div>

            {/* Apply Link */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Application Link
              </label>
              <input
                placeholder="https://company.com/careers/apply"
                value={form.applyLink}
                onChange={(e) => setForm({ ...form, applyLink: e.target.value })}
                className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                         focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100
                         dark:focus:ring-purple-900 transition-all duration-200
                         bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {editJobId ? (
                <>
                  <button
                    onClick={handleUpdate}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <Save className="w-5 h-5" />
                    Update Job
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-semibold transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCreate}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <Plus className="w-5 h-5" />
                  Create Job Posting
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            All Job Postings
          </h2>

          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading jobs...</p>
            </div>
          ) : Array.isArray(jobs) && jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {job.company}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {job.type}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                          <DollarSign className="w-4 h-4" />
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(job)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-2">No jobs posted yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Create your first job posting above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}