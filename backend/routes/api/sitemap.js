import Job from "../../models/Job.js";
import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";

export default async function handler(req, res) {
  try {
    const jobs = await Job.find().select("slug createdAt");
    const links = [
      { url: "/", changefreq: "daily", priority: 1.0 },
      ...jobs.map(job => ({
        url: `/job/${job._id}`,
        changefreq: "daily",
        priority: 0.8,
        lastmodISO: job.createdAt.toISOString(),
      })),
    ];
    const stream = new SitemapStream({ hostname: "https://jobhuntdirect.jobsearchjob.xyz" });
    const xmlString = await streamToPromise(Readable.from(links).pipe(stream));
    res.setHeader("Content-Type", "application/xml");
    res.send(xmlString.toString());
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
}
