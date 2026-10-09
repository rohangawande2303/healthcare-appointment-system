const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

/**
 * Review Routes
 * Base path: /api/reviews
 */

router.post('/', protect, reviewController.createReview);
router.get('/doctor/:id', reviewController.getDoctorReviews);

module.exports = router;
