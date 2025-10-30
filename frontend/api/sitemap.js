export default async function handler(req, res) {
  try {
    const response = await fetch("https://jobhuntdirect.onrender.com/sitemap.xml");
    const xml = await response.text();

    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch sitemap");
  }
}
