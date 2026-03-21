const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SES_SMTP_HOST,
  port: parseInt(process.env.SES_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SES_SMTP_USER,
    pass: process.env.SES_SMTP_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"UniGest" <${process.env.SES_FROM_EMAIL}>`,
      to, subject, html,
    });
    console.log('Email envoye:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch(e) {
    console.error('Erreur email:', e.message);
    return { success: false, error: e.message };
  }
}

module.exports = { sendEmail };
