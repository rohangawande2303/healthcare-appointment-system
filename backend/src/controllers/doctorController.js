const { query } = require('../config/database');
const Doctor = require('../models/Doctor');

/**
 * Doctor Controller
 * Handles doctor listings, profile details, and availability management.
 */
const doctorController = {
  /**
   * Get paginated list of doctors with filters
   * GET /api/doctors?page=1&limit=10&specialty=Cardiology&search=John
   */
  getDoctors: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, specialty, search, location, city, lat, lng, minFee, maxFee } = req.query;
      const offset = (page - 1) * limit;

      let selectFields = `d.*, u.name, u.email`;
      let orderBy = `d.rating DESC, d.experience DESC, d.created_at DESC`;

      const params = [];

      // If user provides lat and lng for "near me" proximity search
      if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
        params.push(parseFloat(lat), parseFloat(lng));
        const latIdx = params.length - 1;
        const lngIdx = params.length;
        selectFields += `, ROUND((6371 * acos(least(1.0, greatest(-1.0, cos(radians($${latIdx})) * cos(radians(d.latitude)) * cos(radians(d.longitude) - radians($${lngIdx})) + sin(radians($${latIdx})) * sin(radians(d.latitude))))))::numeric, 1) AS distance, ROUND((6371 * acos(least(1.0, greatest(-1.0, cos(radians($${latIdx})) * cos(radians(d.latitude)) * cos(radians(d.longitude) - radians($${lngIdx})) + sin(radians($${latIdx})) * sin(radians(d.latitude))))))::numeric, 1) AS distance_km`;
        orderBy = `distance ASC, d.rating DESC`;
      }

      let queryString = `
        SELECT ${selectFields} 
        FROM doctors d 
        JOIN users u ON d.user_id = u.id 
        WHERE 1=1
      `;

      if (specialty) {
        params.push(specialty);
        queryString += ` AND d.specialty = $${params.length}`;
      }

      if (search) {
        params.push(`%${search}%`);
        queryString += ` AND (u.name ILIKE $${params.length} OR d.specialty ILIKE $${params.length})`;
      }
      
      if (city) {
        params.push(`%${city}%`);
        queryString += ` AND (d.city ILIKE $${params.length} OR d.location ILIKE $${params.length})`;
      }

      if (location) {
        params.push(`%${location}%`);
        queryString += ` AND (d.location ILIKE $${params.length} OR d.city ILIKE $${params.length})`;
      }

      if (minFee) {
        params.push(minFee);
        queryString += ` AND d.consultation_fee >= $${params.length}`;
      }

      if (maxFee) {
        params.push(maxFee);
        queryString += ` AND d.consultation_fee <= $${params.length}`;
      }

      // Add pagination
      queryString += ` ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit), parseInt(offset));

      const result = await query(queryString, params);

      // Get total count for pagination metadata
      let countQuery = `SELECT COUNT(*) FROM doctors d JOIN users u ON d.user_id = u.id WHERE 1=1`;
      const countParams = [];
      
      if (specialty) {
        countParams.push(specialty);
        countQuery += ` AND d.specialty = $${countParams.length}`;
      }
      if (search) {
        countParams.push(`%${search}%`);
        countQuery += ` AND (u.name ILIKE $${countParams.length} OR d.specialty ILIKE $${countParams.length})`;
      }
      if (city) {
        countParams.push(`%${city}%`);
        countQuery += ` AND (d.city ILIKE $${countParams.length} OR d.location ILIKE $${countParams.length})`;
      }
      if (location) {
        countParams.push(`%${location}%`);
        countQuery += ` AND (d.location ILIKE $${countParams.length} OR d.city ILIKE $${countParams.length})`;
      }
      if (minFee) {
        countParams.push(minFee);
        countQuery += ` AND d.consultation_fee >= $${countParams.length}`;
      }
      if (maxFee) {
        countParams.push(maxFee);
        countQuery += ` AND d.consultation_fee <= $${countParams.length}`;
      }

      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      res.status(200).json({
        success: true,
        data: result.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get list of all distinct cities with doctors
   * GET /api/doctors/cities
   */
  getCities: async (req, res, next) => {
    try {
      const result = await query(
        'SELECT DISTINCT city FROM doctors WHERE city IS NOT NULL ORDER BY city ASC'
      );
      const cities = result.rows.map(r => r.city);
      res.status(200).json({
        success: true,
        data: cities,
        cities: cities
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get single doctor details by ID
   * GET /api/doctors/:id
   */
  getDoctorById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await query(
        'SELECT d.*, u.name, u.email FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }

      res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Set doctor availability schedule
   * POST /api/doctors/availability
   */
  setAvailability: async (req, res, next) => {
    try {
      const { availability_json } = req.body;
      const userId = req.user.id;

      const result = await query(
        'UPDATE doctors SET availability_json = $1 WHERE user_id = $2 RETURNING *',
        [JSON.stringify(availability_json), userId]
      );

      res.status(200).json({
        success: true,
        message: 'Availability updated successfully',
        data: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get available slots for a doctor on a specific date
   * GET /api/doctors/:id/availability?date=2024-05-20
   */
  getAvailableSlots: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ success: false, message: 'Date is required' });
      }

      // 1. Get doctor's base schedule
      const doctorResult = await query('SELECT availability_json FROM doctors WHERE id = $1', [id]);
      if (doctorResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }

      const schedule = doctorResult.rows[0].availability_json || {};
      const targetDate = new Date(date);
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      let baseSlots = schedule[dayName] || [];

      // 2. Filter out past slots if date is today
      const today = new Date();
      const isToday = targetDate.toDateString() === today.toDateString();
      
      if (isToday) {
        const currentTime = today.getHours() * 60 + today.getMinutes();
        baseSlots = baseSlots.filter(slot => {
          const [hours, minutes] = slot.split(':').map(Number);
          const slotTime = hours * 60 + minutes;
          return slotTime > currentTime + 30; // 30 min buffer
        });
      }

      // 3. Get booked appointments for this date
      const appointmentsResult = await query(
        'SELECT time_slot FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND status != $3',
        [id, date, 'cancelled']
      );
      const bookedSlots = appointmentsResult.rows.map(row => row.time_slot);

      // 3. Filter out booked slots
      const availableSlots = baseSlots.filter(slot => !bookedSlots.includes(slot));

      res.status(200).json({
        success: true,
        date,
        day: dayName,
        slots: availableSlots
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Verify or unverify doctor (Admin only)
   * PATCH /api/doctors/:id/verify
   */
  verifyDoctor: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { is_verified } = req.body;
      const result = await query(
        'UPDATE doctors SET is_verified = $1 WHERE id = $2 RETURNING *',
        [is_verified !== undefined ? is_verified : true, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }
      res.status(200).json({
        success: true,
        message: 'Doctor verification status updated',
        data: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = doctorController;
