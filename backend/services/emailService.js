const path = require('path');
const dotenv = require('dotenv');

// Load environment variables if not already initialized
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const nodemailer = require('nodemailer');

function getEmailCredentials() {
  const fromEmail = (process.env.SENDGRID_FROM_EMAIL || '').trim();
  const fromName = (process.env.SENDGRID_FROM_NAME || 'Alumni Portal').trim();
  const rawPass = (process.env.SENDGRID_API_KEY || '').trim();
  const pass = rawPass.replace(/\s+/g, '');
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = port === 465;

  return {
    user: 'apikey',
    pass,
    fromEmail,
    fromName,
    port,
    secure
  };
}

let cachedTransporter = null;
let cachedAuthKey = null;

function getTransporter() {
  const { user, pass, port, secure } = getEmailCredentials();

  if (!pass) {
    return null;
  }

  const authKey = `${user}:${pass}:${port}`;

  if (!cachedTransporter || cachedAuthKey !== authKey) {
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port,
      secure, // true for port 465, false for 587 / 2525 (uses STARTTLS)
      auth: { user, pass },
      pool: true,              // Re-use connections instead of opening per email
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 10000, // 10s timeout
      greetingTimeout: 10000
    });
    cachedAuthKey = authKey;
  }

  return cachedTransporter;
}

/**
 * Send an email with SendGrid SMTP
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} html - HTML email body
 * @param {string} [text] - Optional plain text alternative
 */
async function sendEmail(to, subject, html, text = null) {
  const { fromEmail, fromName, pass } = getEmailCredentials();

  if (!pass || !fromEmail) {
    console.warn(`[DEV EMAIL LOG] No SendGrid credentials configured. Simulated email to: ${to} | Subject: "${subject}"`);
    return { devMode: true, sent: false };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[DEV EMAIL LOG] Email transport unavailable. Simulated email to: ${to} | Subject: "${subject}"`);
    return { devMode: true, sent: false };
  }

  // Generate plain text version from HTML if none was provided (improves spam scores)
  const plainText = text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  // Extract raw email address in case fromEmail includes angle brackets
  const cleanFromEmail = fromEmail.includes('<')
    ? fromEmail.replace(/.*<([^>]+)>.*/, '$1')
    : fromEmail;

  const mailOptions = {
    from: `"${fromName}" <${cleanFromEmail}>`,
    to,
    subject,
    text: plainText,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Sent to ${to} | Subject: "${subject}" | MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, devMode: false };
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, err.message || err);
    throw err;
  }
}

async function verifyEmailService() {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn('⚠️ Email service not configured: SENDGRID_API_KEY is missing.');
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