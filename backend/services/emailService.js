require('dotenv').config();
const nodemailer = require('nodemailer');

const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : '';
const gmailPass = process.env.GMAIL_APP_PASS ? process.env.GMAIL_APP_PASS.replace(/\s+/g, '') : '';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: gmailUser,
    pass: gmailPass
  }
});

async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: `"Alumni Portal" <${gmailUser}>`,
    to,
    subject,
    html
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendEmail;