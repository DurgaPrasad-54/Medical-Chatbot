const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

async function sendMail(to, subject, text) {
  try {
    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from: process.env.EMAIL, // your verified email in Resend
        to,
        subject,
        html: `<h3>${subject}</h3><p>${text}</p>`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Email sent successfully:', response.data);
  } catch (error) {
    console.error('Email send error:', error.response?.data || error.message);
  }
}

module.exports = sendMail;
