const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

/**
 * Queue Routes
 * Base path: /api/queue
 */

router.get('/doctor/:id', protect, queueController.getQueueStatus);
router.put('/update', protect, authorize('doctor', 'admin'), queueController.updateQueue);

module.exports = router;
