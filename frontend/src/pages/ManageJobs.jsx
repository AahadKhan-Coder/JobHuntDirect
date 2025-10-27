import { useState, useEffect } from "react";
import API from "../utils/api";
import { toast } from "react-toastify";

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [editJobId, setEditJobId] = useState(null);
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
    try {
      const res = await API.get("/jobs");
      setJobs(res.data.jobs || res.data);
    } catch {
      toast.error("Failed to fetch jobs");
    }
  };

  const filteredJobs = jobs
    .filter(job =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  const handleEdit = (job) => {
    setEditJobId(job._id);
    setForm({ ...job });
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/jobs/${editJobId}`, form);
      setEditJobId(null);
      fetchJobs();
      toast.success("Job updated");
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
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Jobs</h1>

      {/* Search & Sort */}
      <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-2">
        <input
          placeholder="Search by title or company"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/2"
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="border p-2 rounded w-full md:w-1/4"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="title">Title</option>
        </select>
      </div>

      {/* Edit Form */}
      {editJobId && (
        <div className="mb-4 p-4 border rounded bg-white dark:bg-gray-800">
          <h2 className="font-semibold mb-2">Edit Job</h2>
          <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title:e.target.value})} className="border p-2 w-full mb-2 rounded" />
          <input placeholder="Company" value={form.company} onChange={e => setForm({...form, company:e.target.value})} className="border p-2 w-full mb-2 rounded" />
          <input placeholder="Location" value={form.location} onChange={e => setForm({...form, location:e.target.value})} className="border p-2 w-full mb-2 rounded" />
          <input placeholder="Type" value={form.type} onChange={e => setForm({...form, type:e.target.value})} className="border p-2 w-full mb-2 rounded" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description:e.target.value})} className="border p-2 w-full mb-2 rounded" rows={3}></textarea>
          <input placeholder="Apply Link" value={form.applyLink} onChange={e => setForm({...form, applyLink:e.target.value})} className="border p-2 w-full mb-2 rounded" />
          <div className="flex gap-2">
            <button onClick={handleUpdate} className="bg-yellow-500 text-white px-3 py-2 rounded">Update</button>
            <button onClick={() => setEditJobId(null)} className="bg-gray-500 text-white px-3 py-2 rounded">Cancel</button>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="hidden md:block overflow-x-auto">
        {/* Desktop Table */}
        <table className="w-full text-left border-collapse bg-white dark:bg-gray-800 rounded-lg">
          <thead>
            <tr className="border-b dark:border-gray-600">
              <th className="p-2">Title</th>
              <th className="p-2">Company</th>
              <th className="p-2">Location</th>
              <th className="p-2">Type</th>
              <th className="p-2">Date</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length > 0 ? filteredJobs.map(job => (
              <tr key={job._id} className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="p-2">{job.title}</td>
                <td className="p-2">{job.company}</td>
                <td className="p-2">{job.location}</td>
                <td className="p-2">{job.type}</td>
                <td className="p-2">{new Date(job.createdAt).toLocaleDateString()}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => handleEdit(job)} className="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
                  <button onClick={() => handleDelete(job._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500 dark:text-gray-300">No jobs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      {/* Mobile List */}
<div className="md:hidden flex flex-col gap-1">
  {filteredJobs.length > 0 ? filteredJobs.map(job => (
    <div key={job._id} className="flex justify-between items-center p-3 border-b bg-white dark:bg-gray-800">
      <div className="flex flex-col">
        <span className="font-semibold text-sm">{job.title}</span>
        <span className="text-xs text-gray-500 dark:text-gray-300">{job.company} - {job.location}</span>
        <span className="text-xs text-gray-400 dark:text-gray-400">{job.type} | {new Date(job.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="flex gap-1">
        <button onClick={() => handleEdit(job)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Edit</button>
        <button onClick={() => handleDelete(job._id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Delete</button>
      </div>
    </div>
  )) : (
    <p className="text-center text-gray-500 dark:text-gray-300 p-4">No jobs found.</p>
  )}
</div>

    </div>
  );
}
