const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create Transporter (Configure with your email provider)
  // For Gmail, you might need an "App Password" if 2FA is on.
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or use 'smtp.mailtrap.io' for testing
    auth: {
      user: process.env.EMAIL_USER, // e.g., 'yourname@gmail.com'
      pass: process.env.EMAIL_PASS, // e.g., 'your-app-password'
    },
  });

  // 2. Define Email Options
  const mailOptions = {
    from: `"Gamified DSA" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message, // We will send HTML emails
  };

  // 3. Send
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;