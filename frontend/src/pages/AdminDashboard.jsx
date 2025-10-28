import { useState, useEffect } from "react";
import API from "../utils/api";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
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
    try {
      const res = await API.get("/jobs");
      setJobs(res.data.jobs || res.data);
    } catch (error) {
      toast.error("Failed to fetch jobs");
      console.error(error);
    }
  };

  const handleCreate = async () => {
    const { title, company, location, type, description, applyLink, salary } = form;
    if ([title, company, location, type, description, applyLink, salary].some(v => !v.trim())) {
      return toast.error("All fields are required");
    }

    try {
      await API.post("/jobs", form);
      toast.success("Job created successfully!");
      setForm({
        title: "",
        company: "",
        location: "",
        type: "",
        salary: "",
        description: "",
        applyLink: "",
      });
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
  };

  const handleUpdate = async () => {
    const { title, company, location, type, description, applyLink, salary } = form;
    if ([title, company, location, type, description, applyLink, salary].some(v => !v.trim())) {
      return toast.error("All fields are required");
    }

    try {
      await API.put(`/jobs/${editJobId}`, form);
      toast.success("Job updated successfully!");
      setEditJobId(null);
      setForm({
        title: "",
        company: "",
        location: "",
        type: "",
        salary: "",
        description: "",
        applyLink: "",
      });
      fetchJobs();
    } catch (error) {
      toast.error("Failed to update job");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
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
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Job Form */}
      <div className="mb-6 p-4 border rounded-lg shadow-sm">
        <h2 className="font-semibold mb-2">{editJobId ? "Edit Job" : "Add New Job"}</h2>

        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border p-2 mb-2 w-full rounded"
        />
        <input
          placeholder="Company"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          className="border p-2 mb-2 w-full rounded"
        />
        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="border p-2 mb-2 w-full rounded"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border p-2 mb-2 w-full rounded"
        >
          <option value="">Select Job Type</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Internship">Internship</option>
          <option value="Contract">Contract</option>
        </select>
        <input
          placeholder="Salary (e.g. $60,000 / year)"
          value={form.salary}
          onChange={(e) => setForm({ ...form, salary: e.target.value })}
          className="border p-2 mb-2 w-full rounded"
        />
        <textarea
          placeholder="Job Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 mb-2 w-full rounded"
          rows={4}
        />
        <input
          placeholder="Apply Link"
          value={form.applyLink}
          onChange={(e) => setForm({ ...form, applyLink: e.target.value })}
          className="border p-2 mb-2 w-full rounded"
        />

        <div className="flex gap-2 mt-2">
          {editJobId ? (
            <>
              <button
                onClick={handleUpdate}
                className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 transition"
              >
                Update
              </button>
              <button
                onClick={() =>
                  setEditJobId(null) ||
                  setForm({
                    title: "",
                    company: "",
                    location: "",
                    type: "",
                    salary: "",
                    description: "",
                    applyLink: "",
                  })
                }
                className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleCreate}
              className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition"
            >
              Create
            </button>
          )}
        </div>
      </div>

      {/* Jobs List */}
      <div>
        <h2 className="font-semibold mb-2">All Jobs</h2>
        <ul>
          {Array.isArray(jobs) &&
            jobs.map((job) => (
              <li
                key={job._id}
                className="flex justify-between items-center border p-2 mb-2 rounded"
              >
                <span>
                  {job.title} - {job.company} ({job.type}) 💰 {job.salary || "N/A"}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(job)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
