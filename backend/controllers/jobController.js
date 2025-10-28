import Job from "../models/Job.js";

export const createJob = async (req, res) => {
  const { title, company, location, type, description, applyLink, salary } = req.body;

  if (!title || !company || !location || !type || !description || !applyLink || !salary) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newJob = await Job.create({
      title,
      company,
      location,
      type,
      description,
      applyLink,
      salary,
      createdBy: req.user?._id,
    });
    res.status(201).json(newJob);
  } catch (error) {
    console.error("Create Job Error:", error);
    res.status(500).json({ message: error.message });
  }
};



// Get All Jobs
export const getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const jobs = await Job.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Job.countDocuments();
    res.json({ jobs, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Job
export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Job (Admin)
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Job (Admin)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

