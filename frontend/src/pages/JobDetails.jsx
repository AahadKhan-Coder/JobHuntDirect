import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../utils/api";
import { toast } from "react-toastify";

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await API.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (error) {
        toast.error("Failed to fetch job details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!job) return <div className="p-4 text-red-500">Job not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24">
      <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
      <p className="text-lg font-semibold mb-1">{job.company}</p>
      <p className="text-gray-600 mb-1">{job.location}</p>
      <p className="text-gray-600 mb-3">{job.type}</p>

      <h2 className="text-xl font-semibold mb-1">Job Description</h2>
      <p className="mb-4 whitespace-pre-line">{job.description}</p>

      <div className="fixed bottom-4 left-0 w-full flex justify-center px-4">
        <a
          href={job.applyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 text-white px-6 py-3 rounded shadow-lg hover:bg-blue-600 transition"
        >
          Apply Now
        </a>
      </div>
    </div>
  );
}
