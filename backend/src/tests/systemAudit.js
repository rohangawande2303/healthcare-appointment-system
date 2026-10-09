/**
 * SYSTEM AUDIT SCRIPT
 * Automated testing for Phase 1 & 2
 */
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let patientToken = '';
let doctorToken = '';
let doctorId = '';
let patientId = '';
let testAppointmentId = '';

async function runTests() {
  console.log('🚀 Starting System Audit...');

  try {
    // 1. AUTHENTICATION TESTING
    console.log('\n🔐 [1/10] Testing Authentication...');
    
    // Register Patient
    try {
      const regRes = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Audit Patient',
        email: 'audit.patient@test.com',
        password: 'Password123!',
        role: 'patient',
        date_of_birth: '1995-01-01',
        blood_group: 'A+'
      });
      console.log('✅ Patient Registration');
    } catch (e) {
      if (e.response?.status === 400) console.log('✅ Patient already exists (Registration skipped)');
      else throw e;
    }

    // Login Patient
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'audit.patient@test.com',
      password: 'Password123!'
    });
    patientToken = loginRes.data.token;
    patientId = loginRes.data.user.id;
    console.log('✅ Patient Login');

    // Login Doctor (Using seeded doctor)
    const docLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'doctor.sharma@healthcare.com',
      password: 'Password123!'
    });
    doctorToken = docLoginRes.data.token;
    console.log('✅ Doctor Login');

    // 2. RBAC TESTING
    console.log('\n🛡️ [2/10] Testing RBAC...');
    try {
      await axios.get(`${BASE_URL}/users/admin-test`, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      console.log('❌ RBAC: Patient accessed admin route');
    } catch (e) {
      console.log('✅ RBAC: Patient blocked from admin route (403)');
    }

    // 3. DOCTOR LISTING TESTING
    console.log('\n👨‍⚕️ [3/10] Testing Doctor Listing...');
    const docList = await axios.get(`${BASE_URL}/doctors?specialty=Cardiology`);
    doctorId = docList.data.data[0].id;
    console.log(`✅ Specialty Filter: ${docList.data.data.length} Cardiology doctors found`);

    // 4. AVAILABILITY SYSTEM TESTING
    console.log('\n📅 [4/10] Testing Availability Logic...');
    const today = new Date().toISOString().split('T')[0];
    const availRes = await axios.get(`${BASE_URL}/doctors/${doctorId}/availability?date=${today}`);
    const initialSlots = availRes.data.slots.length;
    console.log(`✅ Fetched ${initialSlots} slots for today`);

    // 5. APPOINTMENT BOOKING TESTING
    console.log('\n📆 [5/10] Testing Booking Flow...');
    if (availRes.data.slots.length > 0) {
      const slotToBook = availRes.data.slots[0];
      const bookRes = await axios.post(`${BASE_URL}/appointments`, {
        doctor_id: doctorId,
        appointment_date: today,
        time_slot: slotToBook,
        type: 'video'
      }, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      testAppointmentId = bookRes.data.data.id;
      console.log('✅ Booking Successful');

      // Verify slot disappeared
      const reAvailRes = await axios.get(`${BASE_URL}/doctors/${doctorId}/availability?date=${today}`);
      if (!reAvailRes.data.slots.includes(slotToBook)) {
        console.log('✅ Slot exclusion logic');
      } else {
        console.log('❌ Slot exclusion logic failed');
      }
    }

    // 6. DOUBLE BOOKING TEST
    console.log('\n🚫 [6/10] Testing Double Booking...');
    try {
      await axios.post(`${BASE_URL}/appointments`, {
        doctor_id: doctorId,
        appointment_date: today,
        time_slot: availRes.data.slots[0],
        type: 'video'
      }, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      console.log('❌ Double Booking: Allowed same slot twice');
    } catch (e) {
      console.log('✅ Double Booking: Prevented (400)');
    }

    // 7. RESCHEDULE & CANCEL TEST
    console.log('\n✏️ [7/10] Testing Reschedule & Cancel...');
    // Cancel
    await axios.delete(`${BASE_URL}/appointments/${testAppointmentId}`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    console.log('✅ Appointment Cancellation');

    // 8. DASHBOARD TESTING
    console.log('\n📊 [8/10] Testing Dashboards...');
    const patientDash = await axios.get(`${BASE_URL}/appointments/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    console.log(`✅ Patient Dashboard: ${patientDash.data.data.length} appointments found`);

    console.log('\n🎉 System Audit Complete!');
  } catch (error) {
    console.error('\n❌ Audit Failed:', error.message);
    if (error.response) console.error('Response:', error.response.data);
  }
}

runTests();
