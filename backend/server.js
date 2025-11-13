import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import supportRoutes from "./routes/support.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);
app.use("/api/support", supportRoutes);

app.get("/sitemap.xml", (req, res) => {
  res.header("Content-Type", "application/xml");
  res.header("Access-Control-Allow-Origin", "*");      
  res.header("Access-Control-Allow-Credentials", "false"); 

  const sitemapPath = path.join(process.cwd(), "sitemap.xml");
  const sitemap = fs.readFileSync(sitemapPath, "utf-8");
  res.send(sitemap);
});

app.get("/robots.txt", (req, res) => {
  res.header("Content-Type", "text/plain");
  const robotsPath = path.join(process.cwd(), "robots.txt");
  const robots = fs.readFileSync(robotsPath, "utf-8");
  res.send(robots);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
