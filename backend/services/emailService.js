const path = require('path');
const dotenv = require('dotenv');

// Ensure .env is loaded from the backend first, then the workspace root.
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const nodemailer = require('nodemailer');

function getEmailCredentials() {
  const fromEmail = (process.env.GMAIL_USER || '').trim();
  const rawPass = (process.env.GMAIL_APP_PASS || '').trim();
  const pass = rawPass.replace(/\s+/g, '');

  return {
    user: fromEmail,
    pass,
    fromEmail
  };
}

let cachedTransporter = null;
let cachedAuthKey = null;

function getTransporter() {
  const { user, pass } = getEmailCredentials();

  if (!pass) {
    return null;
  }

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
  const { fromEmail, pass } = getEmailCredentials();

  if (!pass || !fromEmail) {
    console.warn(`[DEV EMAIL LOG] No valid Gmail credentials configured. To: ${to} | Subject: ${subject}`);
    return { devMode: true, sent: false };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[DEV EMAIL LOG] Email transport is unavailable. To: ${to} | Subject: ${subject}`);
    return { devMode: true, sent: false };
  }

  const mailOptions = {
    from: `"Alumni Portal" <${fromEmail}>`,
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
    if (!transporter) {
      console.warn('⚠️ Email service not configured: GMAIL_APP_PASS is missing.');
      return false;
    }

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
