const nodemailer = require("nodemailer");

/**
 * Gửi email sử dụng Nodemailer
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  // Cấu hình transporter - sử dụng Gmail SMTP (hoặc dịch vụ khác qua biến môi trường)
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,   // Email gửi đi (vd: noreply@techvie.com)
      pass: process.env.EMAIL_PASS,   // App Password của Gmail
    },
  });

  const mailOptions = {
    from: `"TechVie Shop" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[EMAIL] Đã gửi email đến ${to} — Message ID: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
