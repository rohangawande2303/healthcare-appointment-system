const express = require('express');
const router = express.Router();

/**
 * Medicine Routes
 * Proxies medicine search requests to the Python microservice (OpenFDA)
 */
router.get('/search', async (req, res, next) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Medicine name is required' });
    }

    const pythonUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8001';
    const response = await fetch(`${pythonUrl}/api/medicine/search?name=${encodeURIComponent(name)}`);
    const data = await response.json();

    res.status(response.status).json(data);
  } catch (err) {
    console.error(`[MEDICINE SERVICE] Proxy error: ${err.message}`);
    res.status(502).json({
      success: false,
      message: 'Failed to communicate with medicine lookup microservice'
    });
  }
});

module.exports = router;
