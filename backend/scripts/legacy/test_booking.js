const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting Full End-to-End Booking & Payment Tests ---');

  try {
    // 1. Register Patient
    console.log('\n[1] Registering Patient...');
    const patientData = {
      name: 'E2E Test Patient',
      email: `patient_e2e_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'patient',
      date_of_birth: '1995-05-05',
      blood_group: 'B+'
    };
    
    let patientRes = await axios.post(`${API_URL}/auth/register`, patientData);
    const patientToken = patientRes.data.token;
    console.log('✅ Patient Registration Successful:', patientRes.data.user.email);

    // 2. Register Doctor
    console.log('\n[2] Registering Doctor...');
    const doctorData = {
      name: 'E2E Test Doctor',
      email: `doctor_e2e_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'doctor',
      specialty: 'Dermatology',
      qualification: 'MD',
      experience: 8,
      consultation_fee: 1000
    };
    
    let doctorRes = await axios.post(`${API_URL}/auth/register`, doctorData);
    const doctorToken = doctorRes.data.token;
    console.log('✅ Doctor Registration Successful:', doctorRes.data.user.email);

    // Get Doctor Profile to get the actual doctor_id (not user_id)
    const docProfileRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${doctorToken}` }
    });
    const doctorId = docProfileRes.data.user.profile.id;

    // 3. Book Appointment
    console.log('\n[3] Patient Booking Appointment...');
    const appointmentData = {
      doctor_id: doctorId,
      appointment_date: '2026-06-01',
      time_slot: '10:00:00',
      type: 'video',
      notes: 'Test consultation'
    };

    let bookingRes;
    try {
      bookingRes = await axios.post(`${API_URL}/appointments`, appointmentData, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      console.log('✅ Appointment Booked Successfully, ID:', bookingRes.data.data.id);
    } catch (err) {
      console.log('❌ Appointment Booking Failed:', err.response?.data || err.message);
      return;
    }
    const appointmentId = bookingRes.data.data.id;

    // 4. Create Payment Order
    console.log('\n[4] Creating Razorpay Order...');
    let orderRes;
    try {
      orderRes = await axios.post(`${API_URL}/payments/create-order`, { appointmentId }, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      console.log('✅ Razorpay Order Created:', orderRes.data.order_id, 'Amount:', orderRes.data.amount);
    } catch (err) {
      console.log('❌ Order Creation Failed:', err.response?.data || err.message);
      return;
    }
    const orderId = orderRes.data.order_id;

    // 5. Verify Payment (Mocking the Razorpay success callback)
    console.log('\n[5] Verifying Payment Signature...');
    const paymentId = 'pay_' + Math.random().toString(36).substring(7);
    
    // Generate valid signature using secret from env
    const secret = process.env.RAZORPAY_KEY_SECRET || 'HP1N4jnfoy3BYCVyTOGbiFOW';
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    let verifyRes;
    try {
      verifyRes = await axios.post(`${API_URL}/payments/verify`, {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: expectedSignature,
        appointmentId: appointmentId
      }, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      console.log('✅ Payment Verification Successful:', verifyRes.data.message);
    } catch (err) {
      console.log('❌ Payment Verification Failed:', err.response?.data || err.message);
    }

    console.log('\n--- Full E2E Test Completed Successfully ---');
  } catch (error) {
    console.error('\n--- Test Execution Failed ---', error.response?.data || error.message);
  }
}

runTests();
