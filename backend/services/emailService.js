require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY
  }
});

async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: 'Alumni Portal <onboarding@resend.dev>',
    to,
    subject,
    html
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendEmail;