import express from "express";
import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";
import Job from "../models/Job.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const jobs = await Job.find().select("slug createdAt"); 

    const links = [
      { url: "/", changefreq: "daily", priority: 1.0 },
      { url: "/about", changefreq: "monthly", priority: 0.5 },
      // add more static pages
      ...jobs.map((job) => ({
        url: `/job/${job._id}`,
        changefreq: "daily",
        priority: 0.8,
        lastmodISO: job.createdAt.toISOString(),
      })),
    ];

    const stream = new SitemapStream({
      hostname: "https://jobhuntdirect.jobsearchjob.xyz",
    });

    res.header("Content-Type", "application/xml");

    const xmlString = await streamToPromise(Readable.from(links).pipe(stream));
    res.send(xmlString.toString());
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

export default router;
