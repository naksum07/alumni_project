const path = require('path');
// Ensure .env is loaded regardless of the process working directory
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

const nodemailer = require('nodemailer');

function getEmailCredentials() {
  const user = (process.env.GMAIL_USER || 'alumniconnect.iu@gmail.com').trim();
  const rawPass = process.env.GMAIL_APP_PASS || 'opjt edee gedn dcpr';
  const pass = rawPass.replace(/\s+/g, '');
  return { user, pass };
}

let cachedTransporter = null;
let cachedAuthKey = null;

function getTransporter() {
  const { user, pass } = getEmailCredentials();
  const authKey = `${user}:${pass}`;

  if (!cachedTransporter || cachedAuthKey !== authKey) {
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
    cachedAuthKey = authKey;
  }

  return cachedTransporter;
}

async function sendEmail(to, subject, html) {
  const { user, pass } = getEmailCredentials();

  if (!user || !pass) {
    console.warn(`[DEV EMAIL LOG] No credentials configured. To: ${to} | Subject: ${subject}`);
    return { devMode: true, sent: false };
  }

  const transporter = getTransporter();
  const mailOptions = {
    from: `"Alumni Portal" <${user}>`,
    to,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Sent to ${to} | Subject: "${subject}" | MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, err.message || err);
    throw err;
  }
}

async function verifyEmailService() {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('✅ Email service (SMTP) ready');
    return true;
  } catch (err) {
    console.error('❌ Email service (SMTP) verification failed:', err.message || err);
    return false;
  }
}

module.exports = sendEmail;
module.exports.sendEmail = sendEmail;
module.exports.verifyEmailService = verifyEmailService;
module.exports.getTransporter = getTransporter;