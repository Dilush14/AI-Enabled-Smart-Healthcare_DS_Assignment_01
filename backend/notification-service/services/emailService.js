const nodemailer = require('nodemailer');

function normalizePassword(value) {
  return String(value || '').replace(/\s+/g, '');
}

class EmailService {
  isConfigured() {
    return Boolean(process.env.NODEMAILER_HOST && process.env.NODEMAILER_USER && process.env.NODEMAILER_PASS);
  }

  createTransporter() {
    if (!this.isConfigured()) {
      throw new Error('Email service is not configured. Set NODEMAILER_HOST, NODEMAILER_PORT, NODEMAILER_USER, and NODEMAILER_PASS.');
    }

    return nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      port: Number(process.env.NODEMAILER_PORT || 587),
      secure: String(process.env.NODEMAILER_PORT || '587') === '465',
      auth: {
        user: String(process.env.NODEMAILER_USER || '').trim(),
        pass: normalizePassword(process.env.NODEMAILER_PASS),
      },
    });
  }

  async sendAppointmentStatusEmail({ to, subject, text, html }) {
    if (!to) {
      return false;
    }

    const transporter = this.createTransporter();
    await transporter.sendMail({
      from: process.env.NODEMAILER_FROM || process.env.NODEMAILER_USER,
      to,
      subject,
      text,
      html,
    });
    return true;
  }
}

module.exports = new EmailService();
