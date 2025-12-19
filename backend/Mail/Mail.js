const nodemailer = require("nodemailer");
require("dotenv").config();

const transport = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER, // your email
    pass: process.env.BREVO_SMTP_KEY,  // SMTP key
  },
});

async function sendMail(to, subject, text) {
  try {
    const mailOptions = {
      from: `"My App" <${process.env.BREVO_SMTP_USER}>`,
      to,
      subject,
      text,
    };

    const result = await transport.sendMail(mailOptions);
    console.log("Mail sent:", result.messageId);
    return true;
  } catch (err) {
    console.error("Mail error:", err.message);
    return false;
  }
}

module.exports = sendMail;
