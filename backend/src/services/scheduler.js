const cron = require('node-cron');
const { query } = require('../config/database');
const emailService = require('./emailService');
const twilioService = require('./twilioService');

/**
 * Appointment Scheduler
 * Runs periodic jobs to handle reminders.
 */
let activeTasks = [];

const startScheduler = () => {
  // Clear any previously running tasks
  stopScheduler();

  // 1. Appointment Reminders (Every hour)
  const appointmentTask = cron.schedule('0 * * * *', async () => {
    console.log('[SCHEDULER] Checking for upcoming appointments (24h reminder)...');
    
    try {
      const result = await query(`
        SELECT a.*, ud.name as doctor_name, up.name as patient_name, up.email as patient_email
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users ud ON d.user_id = ud.id
        JOIN patients p ON a.patient_id = p.id
        JOIN users up ON p.user_id = up.id
        WHERE a.appointment_date = CURRENT_DATE + INTERVAL '1 day'
        AND a.status IN ('pending', 'confirmed')
      `);

      for (const appointment of result.rows) {
        await emailService.sendReminderEmail(appointment, {
          name: appointment.patient_name,
          email: appointment.patient_email
        });
      }

      if (result.rows.length > 0) {
        console.log(`[SCHEDULER] Sent ${result.rows.length} appointment reminders.`);
      }
    } catch (err) {
      console.error(`[SCHEDULER] Error running appointment reminder job: ${err.message}`);
    }
  });

  // 2. Medicine Reminders (Every minute)
  const medicineTask = cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    const today = now.toISOString().split('T')[0];

    try {
      // Find active reminders for today
      const result = await query(`
        SELECT r.*, u.name as patient_name, u.email as patient_email
        FROM medicine_reminders r
        JOIN patients p ON r.patient_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE r.is_active = true
        AND r.start_date <= $1 AND r.end_date >= $1
      `, [today]);

      for (const reminder of result.rows) {
        const times = reminder.reminder_times_json;
        if (times && times.includes(currentTime)) {
          console.log(`[SCHEDULER] Sending medicine reminder for ${reminder.medicine_name} to ${reminder.patient_name}`);
          const message = `Hi ${reminder.patient_name}, this is a reminder from HealthEase to take your medicine: ${reminder.medicine_name} (${reminder.dosage}). Frequency: ${reminder.frequency}. Stay healthy!`;
          console.log(`[DEMO-SMS] ${message}`);
        }
      }
    } catch (err) {
      console.error(`[SCHEDULER] Error running medicine reminder job: ${err.message}`);
    }
  });

  activeTasks = [appointmentTask, medicineTask];
  console.log('[SCHEDULER] All background jobs started.');
};

const stopScheduler = () => {
  if (activeTasks.length > 0) {
    activeTasks.forEach((t) => t.stop());
    activeTasks = [];
    console.log('[SCHEDULER] Background jobs stopped cleanly.');
  }
};

module.exports = { startScheduler, stopScheduler };
