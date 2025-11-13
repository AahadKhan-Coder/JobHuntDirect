import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import fs from "fs";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import supportRoutes from "./routes/support.js";

import Job from "./models/Job.js";

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Allow frontend to fetch APIs
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);
app.use("/api/support", supportRoutes);

// Dynamic sitemap.xml
app.get("/sitemap.xml", async (req, res) => {
  try {
    res.header("Content-Type", "application/xml");
    res.header("Access-Control-Allow-Origin", "*");       // allow Googlebot
    res.header("Access-Control-Allow-Credentials", "false");

    const jobs = await Job.find().select("createdAt updatedAt");

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Homepage
    sitemap += `  <url>\n`;
    sitemap += `    <loc>https://jobhuntdirect.jobsearchjob.xyz/</loc>\n`;
    sitemap += `    <changefreq>daily</changefreq>\n`;
    sitemap += `    <priority>1.0</priority>\n`;
    sitemap += `  </url>\n`;

    // Jobs
    jobs.forEach((job) => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>https://jobhuntdirect.jobsearchjob.xyz/job/${job._id}</loc>\n`;
      sitemap += `    <lastmod>${job.updatedAt.toISOString()}</lastmod>\n`;
      sitemap += `    <changefreq>daily</changefreq>\n`;
      sitemap += `    <priority>0.8</priority>\n`;
      sitemap += `  </url>\n`;
    });

    sitemap += `</urlset>`;
    res.send(sitemap);
  } catch (err) {
    console.error("Error generating sitemap:", err);
    res.status(500).send("Internal Server Error");
  }
});

// robots.txt
app.get("/robots.txt", (req, res) => {
  res.header("Content-Type", "text/plain");
  res.send(`User-agent: *
Allow: /
Sitemap: https://jobhuntdirect.jobsearchjob.xyz/sitemap.xml`);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
