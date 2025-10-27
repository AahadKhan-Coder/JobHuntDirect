import { useEffect, useState, useContext } from "react";
import API from "../utils/api";
import JobCard from "../components/JobCard";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SavedJobs() {
  const { user, loading } = useContext(AuthContext);
  const [savedJobs, setSavedJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login"); // redirect if not logged in
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const res = await API.get("/users/saved");
        setSavedJobs(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    if (user) fetchSavedJobs();
  }, [user]);

  const handleUnsave = (jobId) => {
    setSavedJobs((prev) => prev.filter((job) => job._id !== jobId));
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Saved Jobs</h1>
      {savedJobs.length === 0 ? (
        <p>You haven’t saved any jobs yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedJobs.map((job) => (
            <JobCard key={job._id} job={job} onUnsave={handleUnsave} />
          ))}
        </div>
      )}
    </div>
  );
}
