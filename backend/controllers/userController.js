import User from "../models/User.js";
import Job from "../models/Job.js";

// ✅ Save a job
export const saveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = await User.findById(req.user._id);

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Avoid duplicates
    if (user.savedJobs.includes(jobId))
      return res.status(400).json({ message: "Job already saved" });

    user.savedJobs.push(jobId);
    await user.save();

    res.json({ message: "Job saved successfully", savedJobs: user.savedJobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Unsave a job
export const unsaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = await User.findById(req.user._id);

    user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
    await user.save();

    res.json({ message: "Job removed from saved list", savedJobs: user.savedJobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📋 Get all saved jobs
export const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedJobs");
    res.json(user.savedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
