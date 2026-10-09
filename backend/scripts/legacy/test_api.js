const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting API Tests ---');

  try {
    // 1. Register Patient
    console.log('\n[1] Registering Patient...');
    const patientData = {
      name: 'Test Patient',
      email: `patient_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'patient',
      date_of_birth: '1990-01-01',
      blood_group: 'O+'
    };
    
    let patientRes;
    try {
      patientRes = await axios.post(`${API_URL}/auth/register`, patientData);
      console.log('✅ Patient Registration Successful:', patientRes.data.user.email);
    } catch (err) {
      console.log('❌ Patient Registration Failed:', err.response?.data || err.message);
      return;
    }

    // 2. Register Doctor
    console.log('\n[2] Registering Doctor...');
    const doctorData = {
      name: 'Test Doctor',
      email: `doctor_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'doctor',
      specialty: 'General Practice',
      qualification: 'MBBS',
      experience: 5,
      consultation_fee: 500
    };
    
    let doctorRes;
    try {
      doctorRes = await axios.post(`${API_URL}/auth/register`, doctorData);
      console.log('✅ Doctor Registration Successful:', doctorRes.data.user.email);
    } catch (err) {
      console.log('❌ Doctor Registration Failed:', err.response?.data || err.message);
      return;
    }

    // 3. Login Patient
    console.log('\n[3] Logging in Patient...');
    let patientLoginRes;
    try {
      patientLoginRes = await axios.post(`${API_URL}/auth/login`, {
        email: patientData.email,
        password: patientData.password
      });
      console.log('✅ Patient Login Successful');
    } catch (err) {
      console.log('❌ Patient Login Failed:', err.response?.data || err.message);
    }

    // 4. Fetch Patient Profile
    console.log('\n[4] Fetching Patient Profile...');
    try {
      const profileRes = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${patientLoginRes.data.token}` }
      });
      console.log('✅ Patient Profile Fetched:', profileRes.data.user.email);
    } catch (err) {
      console.log('❌ Patient Profile Fetch Failed:', err.response?.data || err.message);
    }

    // 5. Login Doctor
    console.log('\n[5] Logging in Doctor...');
    let doctorLoginRes;
    try {
      doctorLoginRes = await axios.post(`${API_URL}/auth/login`, {
        email: doctorData.email,
        password: doctorData.password
      });
      console.log('✅ Doctor Login Successful');
    } catch (err) {
      console.log('❌ Doctor Login Failed:', err.response?.data || err.message);
    }

    console.log('\n--- API Tests Completed Successfully ---');
  } catch (error) {
    console.error('\n--- API Tests Failed ---', error);
  }
}

runTests();
