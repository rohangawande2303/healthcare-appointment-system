const twilio = require('twilio');

/**
 * Twilio Service
 * Handles SMS notifications.
 */
class TwilioService {
  constructor() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && !process.env.TWILIO_ACCOUNT_SID.includes('your_')) {
        this.client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        this.isConfigured = true;
      } else {
        console.warn('[SMS] Twilio credentials missing or placeholder. SMS service will be mocked.');
        this.isConfigured = false;
      }
    } catch (err) {
      console.error('[SMS] Twilio initialization failed:', err.message);
      this.isConfigured = false;
    }
  }

  /**
   * Send SMS
   * @param {string} to - Recipient phone number
   * @param {string} message - SMS content
   */
  async sendSMS(to, message) {
    if (!this.isConfigured) {
      console.log(`[SMS][MOCK] Sending to ${to}: ${message}`);
      return { sid: 'MOCK_SID_' + Math.random().toString(36).substring(7) };
    }
    try {
      const result = await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to,
      });
      console.log(`[SMS] Sent to ${to}: ${result.sid}`);
      return result;
    } catch (error) {
      console.error(`[SMS] Failed to send to ${to}:`, error.message);
      // We don't throw here to prevent scheduler from crashing
    }
  }
}

module.exports = new TwilioService();
