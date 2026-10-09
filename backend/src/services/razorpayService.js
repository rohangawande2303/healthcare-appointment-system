const Razorpay = require('razorpay');
const crypto = require('crypto');

/**
 * Razorpay Service
 * Handles payment order creation and signature verification.
 */
class RazorpayService {
  constructor() {
    try {
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_ID.includes('your_')) {
        this.instance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        this.isConfigured = true;
      } else {
        console.warn('[PAYMENT] Razorpay credentials missing or placeholder. Payment service will be mocked.');
        this.isConfigured = false;
      }
    } catch (err) {
      console.error('[PAYMENT] Razorpay initialization failed:', err.message);
      this.isConfigured = false;
    }
  }

  /**
   * Create a new payment order
   * @param {number} amount - Amount in INR
   * @param {string} receipt - Unique receipt ID (usually appointment ID)
   * @returns {Promise<Object>} - Razorpay order object
   */
  async createOrder(amount, receipt) {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${receipt}`,
      payment_capture: 1, // Auto capture payment
    };

    if (!this.isConfigured) {
      console.log(`[PAYMENT][MOCK] Creating order for ${amount} INR`);
      return {
        id: 'order_MOCK_' + Math.random().toString(36).substring(7),
        amount: amount * 100,
        currency: 'INR',
        receipt: `receipt_${receipt}`,
        status: 'created'
      };
    }
    try {
      const order = await this.instance.orders.create(options);
      return order;
    } catch (error) {
      console.error('Razorpay Order Creation Error:', error);
      throw new Error('Could not create payment order');
    }
  }

  /**
   * Verify payment signature
   * @param {string} orderId - Razorpay order ID
   * @param {string} paymentId - Razorpay payment ID
   * @param {string} signature - Razorpay signature
   * @returns {boolean} - Is signature valid
   */
  verifySignature(orderId, paymentId, signature) {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }
}

module.exports = new RazorpayService();
