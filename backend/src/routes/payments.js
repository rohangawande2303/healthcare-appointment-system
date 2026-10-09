const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

/**
 * Payment Routes
 * Base path: /api/payments
 */

// All payment routes require authentication
router.use(protect);

router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.get('/:appointmentId', paymentController.getPaymentDetails);

module.exports = router;
