const sendEmail = require('./services/emailService');

(async () => {
  try {
    console.log('Sending test email via Gmail SMTP...');
    const info = await sendEmail(
      'kulungroshika479@gmail.com',
      'Test Email from Alumni Portal',
      '<h2>Hello!</h2><p>Testing Nodemailer + Gmail SMTP integration!</p>'
    );
    console.log('SUCCESS! Email sent successfully.');
    console.log('Message ID:', info.messageId);
  } catch (err) {
    console.error('ERROR: Failed to send email:', err);
  }
})();
