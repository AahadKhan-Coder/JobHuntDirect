import express from "express";
import { createJob, getJobs, getJob, updateJob, deleteJob } from "../controllers/jobController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getJobs);
router.get("/:id", getJob);
router.post("/", protect, adminOnly, createJob);
router.put("/:id", protect, adminOnly, updateJob);
router.delete("/:id", protect, adminOnly, deleteJob);

export default router;
