const sendEmail = require('./services/emailService');

sendEmail(
  'kulungroshika479@gmail.com',
  'Test Email from Alumni Portal',
  '<h2>Hello!</h2><p>Testing Nodemailer + Resend integration.</p>'
);
