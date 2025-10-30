import express from "express";
const router = express.Router();

router.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Sitemap: https://jobhuntdirect.jobsearchjob.xyz/sitemap.xml
`);
});

export default router;
