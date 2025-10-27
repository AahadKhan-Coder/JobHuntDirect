import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { saveJob, unsaveJob, getSavedJobs } from "../controllers/userController.js";

const router = express.Router();

router.post("/save/:jobId", protect, saveJob);
router.delete("/unsave/:jobId", protect, unsaveJob);
router.get("/saved", protect, getSavedJobs);

export default router;
