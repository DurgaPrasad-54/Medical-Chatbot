const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS 
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"MedChat" <${process.env.EMAIL}>`,
      to,
      subject,
      text
    });
    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.error("❌ Email send error:", err);
  }
};

module.exports = sendEmail;
