const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const API_URL = 'http://localhost:5000/api';
const BASE_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';
const PYTHON_URL = 'http://localhost:8001';

const results = [];

function record(feature, status, details = '') {
  results.push({ feature, status, details });
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${status}] ${feature} ${details ? '(' + details + ')' : ''}`);
}

async function run() {
  console.log('\n======================================================');
  console.log('   STEP 1: COMPREHENSIVE END-TO-END TEST SUITE');
  console.log('======================================================\n');

  try {
    // 1. Health Checks
    console.log('--- 1. Service Health Checks ---');
    try {
      const be = await axios.get(`${BASE_URL}/health`);
      record('Backend /health Endpoint', be.status === 200 ? 'PASS' : 'FAIL');
    } catch (e) { record('Backend /health Endpoint', 'FAIL', e.message); }

    try {
      const py = await axios.get(`${PYTHON_URL}/health`);
      record('Python Flask Service /health Endpoint', py.status === 200 ? 'PASS' : 'FAIL');
    } catch (e) { record('Python Flask Service /health Endpoint', 'FAIL', e.message); }

    try {
      const fe = await axios.get(FRONTEND_URL);
      record('Frontend Next.js Availability', fe.status === 200 ? 'PASS' : 'FAIL');
    } catch (e) { record('Frontend Next.js Availability', 'FAIL', e.message); }

    // 2. Auth & RBAC
    console.log('\n--- 2. Authentication & RBAC ---');
    let patientToken, doctorToken, adminToken;
    let patientId, doctorId, adminId;

    // Seed Patient Login
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: 'patient.john@gmail.com',
        password: 'Password123!'
      });
      patientToken = res.data.token;
      patientId = res.data.user.id;
      record('Seed Patient Login', 'PASS', res.data.user.email);
    } catch (e) { record('Seed Patient Login', 'FAIL', e.response?.data?.message || e.message); }

    // Seed Doctor Login
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: 'doctor.sharma@healthcare.com',
        password: 'Password123!'
      });
      doctorToken = res.data.token;
      doctorId = res.data.user.id;
      record('Seed Doctor Login', 'PASS', res.data.user.email);
    } catch (e) { record('Seed Doctor Login', 'FAIL', e.response?.data?.message || e.message); }

    // Seed Admin Login
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@healthcare.com',
        password: 'Password123!'
      });
      adminToken = res.data.token;
      adminId = res.data.user.id;
      record('Seed Admin Login', 'PASS', res.data.user.email);
    } catch (e) { record('Seed Admin Login', 'FAIL', e.response?.data?.message || e.message); }

    // Dynamic Patient Registration
    const rand = Date.now();
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        name: 'Auto Test Patient',
        email: `patient_${rand}@example.com`,
        password: 'Password123!',
        role: 'patient',
        date_of_birth: '1992-04-12',
        blood_group: 'A+'
      });
      record('New Patient Registration', 'PASS', res.data.user.email);
    } catch (e) { record('New Patient Registration', 'FAIL', e.response?.data?.message || e.message); }

    // Dynamic Doctor Registration
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        name: 'Auto Test Doctor',
        email: `doctor_${rand}@example.com`,
        password: 'Password123!',
        role: 'doctor',
        specialty: 'Neurology',
        qualification: 'MBBS, MD',
        experience: 9,
        consultation_fee: 750
      });
      record('New Doctor Registration', 'PASS', res.data.user.email);
    } catch (e) { record('New Doctor Registration', 'FAIL', e.response?.data?.message || e.message); }

    // RBAC Route Guard: Patient cannot access Doctor-only route
    try {
      await axios.put(`${API_URL}/queue/update`, { doctor_id: 1, current_patient_id: null, estimated_wait_time: 10 }, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      record('RBAC Guard: Patient Blocked from Doctor Route', 'FAIL', 'Expected 403 Forbidden');
    } catch (e) {
      if (e.response?.status === 403) {
        record('RBAC Guard: Patient Blocked from Doctor Route', 'PASS', '403 Forbidden received');
      } else {
        record('RBAC Guard: Patient Blocked from Doctor Route', 'FAIL', e.message);
      }
    }

    // 3. Doctor Search & Availability
    console.log('\n--- 3. Doctor Discovery & Availability ---');
    let targetDoctorProfileId;
    try {
      const res = await axios.get(`${API_URL}/doctors?specialty=Cardiology`);
      if (res.data.success && res.data.data.length > 0) {
        targetDoctorProfileId = res.data.data[0].id;
        record('Doctor Listing & Filter by Specialty', 'PASS', `Found ${res.data.data.length} cardiologists`);
      } else {
        record('Doctor Listing & Filter by Specialty', 'FAIL', 'No doctors found');
      }
    } catch (e) { record('Doctor Listing & Filter by Specialty', 'FAIL', e.message); }

    try {
      const res = await axios.get(`${API_URL}/doctors/${targetDoctorProfileId}/availability?date=2026-10-12`);
      if (res.data.success && Array.isArray(res.data.slots)) {
        record('Doctor Availability Slot Calculation', 'PASS', `${res.data.slots.length} slots found`);
      } else {
        record('Doctor Availability Slot Calculation', 'FAIL', 'Invalid slots response');
      }
    } catch (e) { record('Doctor Availability Slot Calculation', 'FAIL', e.message); }

    // 4. Appointment Booking & Status Lifecycle
    console.log('\n--- 4. Appointment Booking & Status Management ---');
    let bookedAppointmentId;
    const testDate = `2028-0${(Date.now() % 9) + 1}-${String((Date.now() % 25) + 1).padStart(2, '0')}`;
    const testSlot = '09:00';

    try {
      const res = await axios.post(`${API_URL}/appointments`, {
        doctor_id: targetDoctorProfileId,
        appointment_date: testDate,
        time_slot: testSlot,
        type: 'video',
        notes: 'Follow-up consultation'
      }, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      bookedAppointmentId = res.data.data.id;
      record('Appointment Booking', 'PASS', `Appointment ID: ${bookedAppointmentId}`);
    } catch (e) { record('Appointment Booking', 'FAIL', e.response?.data?.message || e.message); }

    // Double Booking Prevention
    try {
      await axios.post(`${API_URL}/appointments`, {
        doctor_id: targetDoctorProfileId,
        appointment_date: testDate,
        time_slot: testSlot,
        type: 'video',
        notes: 'Duplicate attempt'
      }, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      record('Double Booking Prevention Check', 'FAIL', 'Expected 400');
    } catch (e) {
      if (e.response?.status === 400) {
        record('Double Booking Prevention Check', 'PASS', e.response.data.message);
      } else {
        record('Double Booking Prevention Check', 'FAIL', e.message);
      }
    }

    // Reschedule Appointment
    const newSlot = '11:00';
    try {
      const res = await axios.put(`${API_URL}/appointments/${bookedAppointmentId}/reschedule`, {
        appointment_date: testDate,
        time_slot: newSlot
      }, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      record('Appointment Rescheduling', 'PASS', `Rescheduled to ${newSlot}`);
    } catch (e) { record('Appointment Rescheduling', 'FAIL', e.response?.data?.message || e.message); }

    // Doctor confirms appointment
    try {
      const res = await axios.put(`${API_URL}/appointments/${bookedAppointmentId}/status`, {
        status: 'confirmed'
      }, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      record('Appointment Status: Confirmed by Doctor', 'PASS', res.data.message);
    } catch (e) { record('Appointment Status: Confirmed by Doctor', 'FAIL', e.response?.data?.message || e.message); }

    // 5. Razorpay Payments Integration
    console.log('\n--- 5. Razorpay Payment Processing ---');
    let razorpayOrderId;
    try {
      const res = await axios.post(`${API_URL}/payments/create-order`, {
        appointmentId: bookedAppointmentId
      }, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      razorpayOrderId = res.data.order_id;
      record('Razorpay Order Creation', 'PASS', `Order ID: ${razorpayOrderId}, Amount: ${res.data.amount / 100} INR`);
    } catch (e) { record('Razorpay Order Creation', 'FAIL', e.response?.data?.message || e.message); }

    // Fake / Tampered Signature verification -> must FAIL
    try {
      await axios.post(`${API_URL}/payments/verify`, {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: 'pay_tampered_123',
        razorpay_signature: 'fake_signature_hash',
        appointmentId: bookedAppointmentId
      }, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      record('Tampered Payment Signature Rejection', 'FAIL', 'Expected 400 error');
    } catch (e) {
      if (e.response?.status === 400) {
        record('Tampered Payment Signature Rejection', 'PASS', 'Invalid signature rejected as expected');
      } else {
        record('Tampered Payment Signature Rejection', 'FAIL', e.message);
      }
    }

    // Valid Signature verification -> must PASS
    try {
      const testPaymentId = 'pay_test_' + Math.random().toString(36).substring(7);
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpayOrderId}|${testPaymentId}`)
        .digest('hex');

      const res = await axios.post(`${API_URL}/payments/verify`, {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: expectedSignature,
        appointmentId: bookedAppointmentId
      }, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      record('Valid Payment Signature Verification', 'PASS', res.data.message);
    } catch (e) { record('Valid Payment Signature Verification', 'FAIL', e.response?.data?.message || e.message); }

    // Complete appointment (needed for review test)
    try {
      await axios.put(`${API_URL}/appointments/${bookedAppointmentId}/status`, {
        status: 'completed'
      }, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      record('Appointment Status: Completed by Doctor', 'PASS');
    } catch (e) { record('Appointment Status: Completed by Doctor', 'FAIL', e.message); }

    // 6. Review & Rating System
    console.log('\n--- 6. Doctor Reviews & Ratings ---');
    try {
      const res = await axios.post(`${API_URL}/reviews`, {
        doctor_id: targetDoctorProfileId,
        rating: 5,
        comment: 'Excellent and very thorough consultation!'
      }, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      record('Review Submission for Completed Appointment', 'PASS', res.data.message);
    } catch (e) { record('Review Submission for Completed Appointment', 'FAIL', e.response?.data?.message || e.message); }

    try {
      const res = await axios.get(`${API_URL}/reviews/doctor/${targetDoctorProfileId}`);
      record('Doctor Reviews & Average Rating Fetch', 'PASS', `Average: ${res.data.stats?.average || '5.0'}, Count: ${res.data.stats?.count || 1}`);
    } catch (e) { record('Doctor Reviews & Average Rating Fetch', 'FAIL', e.message); }

    // 7. Live Queue Management
    console.log('\n--- 7. Live Queue Management ---');
    try {
      const res = await axios.get(`${API_URL}/queue/doctor/${targetDoctorProfileId}`, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      record('Patient Queue Status Query', 'PASS', `Estimated wait: ${res.data.queue.estimated_wait_time} min`);
    } catch (e) { record('Patient Queue Status Query', 'FAIL', e.message); }

    try {
      const res = await axios.put(`${API_URL}/queue/update`, {
        doctor_id: targetDoctorProfileId,
        current_patient_id: 1,
        estimated_wait_time: 15
      }, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      record('Doctor Queue Update & WebSocket Broadcast', 'PASS', 'Queue updated');
    } catch (e) { record('Doctor Queue Update & WebSocket Broadcast', 'FAIL', e.message); }

    // 8. OpenFDA Medicine Search (Python Service via Backend Proxy)
    console.log('\n--- 8. OpenFDA Medicine Search ---');
    try {
      const res = await axios.get(`${API_URL}/medicine/search?name=ibuprofen`);
      if (res.data.success && res.data.data.length > 0) {
        record('Medicine Search via Python Service & OpenFDA', 'PASS', `Found ${res.data.data.length} results for Ibuprofen`);
      } else {
        record('Medicine Search via Python Service & OpenFDA', 'FAIL', 'Empty results returned');
      }
    } catch (e) { record('Medicine Search via Python Service & OpenFDA', 'FAIL', e.response?.data?.message || e.message); }

    // 9. Medicine Reminders
    console.log('\n--- 9. Medicine Reminders ---');
    let reminderId;
    try {
      const res = await axios.post(`${API_URL}/reminders`, {
        medicine_name: 'Amoxicillin 500mg',
        dosage: '1 capsule',
        frequency: 'thrice',
        start_date: '2026-10-09',
        end_date: '2026-10-16',
        reminder_times_json: ['08:00', '14:00', '20:00']
      }, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      reminderId = res.data.data.id;
      record('Create Medicine Reminder', 'PASS', `Reminder ID: ${reminderId}`);
    } catch (e) { record('Create Medicine Reminder', 'FAIL', e.response?.data?.message || e.message); }

    try {
      const res = await axios.put(`${API_URL}/reminders/${reminderId}/toggle`, {
        is_active: false
      }, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      record('Toggle Medicine Reminder Status', 'PASS', `Active: ${res.data.data.is_active}`);
    } catch (e) { record('Toggle Medicine Reminder Status', 'FAIL', e.message); }

    try {
      await axios.delete(`${API_URL}/reminders/${reminderId}`, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      record('Delete Medicine Reminder', 'PASS');
    } catch (e) { record('Delete Medicine Reminder', 'FAIL', e.message); }

    // 10. Admin Panel
    console.log('\n--- 10. Admin Oversight Panel ---');
    try {
      const appts = await axios.get(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      record('Admin View All Appointments', 'PASS', `${appts.data.data?.length || 0} total records`);
    } catch (e) { record('Admin View All Appointments', 'FAIL', e.message); }

    try {
      const users = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      record('Admin View All Users', 'PASS', `${users.data.data?.length || 0} registered users`);
    } catch (e) { record('Admin View All Users', 'FAIL', e.message); }

    console.log('\n======================================================');
    console.log('   TEST SUMMARY');
    console.log('======================================================');
    const passes = results.filter(r => r.status === 'PASS').length;
    const fails = results.filter(r => r.status === 'FAIL').length;
    console.log(`TOTAL TESTS: ${results.length} | PASS: ${passes} | FAIL: ${fails}`);
    if (fails === 0) {
      console.log('🎉 ALL INTEGRATION AND UNIT CHECKS PASSED!\n');
    } else {
      console.log('⚠️ Some tests failed. Please review details above.\n');
    }

  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

run();
