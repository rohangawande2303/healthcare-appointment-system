const { query } = require('../config/database');
const razorpayService = require('../services/razorpayService');
const emailService = require('../services/emailService');

/**
 * Payment Controller
 * Handles Razorpay order creation, verification, and database updates.
 */
const paymentController = {
  /**
   * Create Razorpay Order
   * POST /api/payments/create-order
   */
  createOrder: async (req, res, next) => {
    try {
      const { appointmentId } = req.body;

      // 1. Fetch appointment details
      const appointmentResult = await query(
        'SELECT a.*, d.consultation_fee FROM appointments a JOIN doctors d ON a.doctor_id = d.id WHERE a.id = $1',
        [appointmentId]
      );

      if (appointmentResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const appointment = appointmentResult.rows[0];
      const amount = appointment.consultation_fee;

      if (!amount || amount < 1) {
        return res.status(400).json({ success: false, message: 'Invalid amount: Must be at least 1 INR (100 paise)' });
      }

      // 2. Create Razorpay order
      const order = await razorpayService.createOrder(amount, appointmentId);

      // 3. Store order info in database
      await query(
        'INSERT INTO payments (appointment_id, amount, razorpay_order_id, status) VALUES ($1, $2, $3, $4) ON CONFLICT (appointment_id) DO UPDATE SET razorpay_order_id = $3, status = $4',
        [appointmentId, amount, order.id, 'created']
      );

      res.status(200).json({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Verify Payment
   * POST /api/payments/verify
   */
  verifyPayment: async (req, res, next) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !appointmentId) {
        return res.status(400).json({ success: false, message: 'Missing required payment fields' });
      }

      // 1. Verify signature
      const isSignatureValid = razorpayService.verifySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isSignatureValid) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }

      // 2. Update payment record
      await query(
        'UPDATE payments SET razorpay_payment_id = $1, status = $2 WHERE razorpay_order_id = $3',
        [razorpay_payment_id, 'paid', razorpay_order_id]
      );

      // 3. Update appointment payment status
      await query(
        "UPDATE appointments SET payment_status = 'paid', status = 'confirmed' WHERE id = $1",
        [appointmentId]
      );

      // 4. Send Receipt/Confirmation Email (Optional but recommended)
      // Here you could generate a PDF and send it, for now we just log
      console.log(`Payment successful for appointment ${appointmentId}`);

      res.status(200).json({
        success: true,
        message: 'Payment verified and appointment confirmed'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get payment details for an appointment
   * GET /api/payments/:appointmentId
   */
  getPaymentDetails: async (req, res, next) => {
    try {
      const { appointmentId } = req.params;
      const result = await query('SELECT * FROM payments WHERE appointment_id = $1', [appointmentId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Payment record not found' });
      }

      res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = paymentController;
