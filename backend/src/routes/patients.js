const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

/**
 * Patient Routes
 * Base path: /api/patients
 */

router.use(protect);
router.use(authorize('patient'));

router.get('/profile', patientController.getProfile);
router.put('/medical-history', patientController.updateMedicalHistory);

module.exports = router;
