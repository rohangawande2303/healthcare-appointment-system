const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

/**
 * Medicine Reminder Routes
 * Base path: /api/reminders
 */

router.use(protect);

router.post('/', reminderController.createReminder);
router.get('/patient/:id', reminderController.getPatientReminders);
router.put('/:id/toggle', reminderController.toggleStatus);
router.delete('/:id', reminderController.deleteReminder);

module.exports = router;
