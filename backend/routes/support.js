import express from "express";
import { Resend } from "resend";

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// POST /support
router.post("/", async (req, res) => {
  const { email, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ error: "Email and message are required." });
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.SUPPORT_RECEIVER_EMAIL,
      subject: `New Support Message from ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 10px;">
          <h3>📩 New Support Message</h3>
          <p><strong>From:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #f4f4f4; padding: 10px; border-radius: 6px;">
            ${message}
          </p>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Resend Error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;
