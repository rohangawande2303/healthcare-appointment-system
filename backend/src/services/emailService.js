const nodemailer = require('nodemailer');

/**
 * Email Service
 * Handles sending confirmation and reminder emails.
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // App Password for Gmail
  }
});

const emailService = {
  /**
   * Send booking confirmation email
   */
  sendBookingConfirmation: async (appointment, recipient) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient.email,
      subject: 'Appointment Confirmed - HealthEase',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #2563eb;">Appointment Confirmed!</h2>
          <p>Hello ${recipient.name},</p>
          <p>Your appointment with <strong>Dr. ${appointment.doctor_name}</strong> has been successfully booked.</p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 10px;">
            <p><strong>Date:</strong> ${new Date(appointment.appointment_date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.time_slot}</p>
            <p><strong>Type:</strong> ${appointment.type}</p>
          </div>
          <p>Please arrive 10 minutes early. If you need to reschedule, visit your dashboard.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b;">This is an automated message from HealthEase. Please do not reply.</p>
        </div>
      `
    };

    try {
      if (process.env.NODE_ENV !== 'test' && process.env.EMAIL_USER) {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Confirmation sent to ${recipient.email}`);
      } else {
        console.log(`[EMAIL][MOCK] Confirmation for ${recipient.email} (Email service not configured)`);
      }
    } catch (err) {
      console.error(`[EMAIL] Failed to send confirmation: ${err.message}`);
    }
  },

  /**
   * Send 24h reminder email
   */
  sendReminderEmail: async (appointment, recipient) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient.email,
      subject: 'Reminder: Upcoming Appointment Tomorrow - HealthEase',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #2563eb;">Appointment Reminder</h2>
          <p>Hello ${recipient.name},</p>
          <p>This is a friendly reminder of your appointment tomorrow with <strong>Dr. ${appointment.doctor_name}</strong>.</p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 10px;">
            <p><strong>Date:</strong> Tomorrow, ${new Date(appointment.appointment_date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.time_slot}</p>
          </div>
          <p>We look forward to seeing you!</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b;">HealthEase Notification System</p>
        </div>
      `
    };

    try {
      if (process.env.NODE_ENV !== 'test' && process.env.EMAIL_USER) {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Reminder sent to ${recipient.email}`);
      } else {
        console.log(`[EMAIL][MOCK] Reminder for ${recipient.email} (Email service not configured)`);
      }
    } catch (err) {
      console.error(`[EMAIL] Failed to send reminder: ${err.message}`);
    }
  }
};

module.exports = emailService;
