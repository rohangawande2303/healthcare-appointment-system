const { Pool } = require('pg');
const fs = require('fs');
const http = require('http');
require('dotenv').config({ path: 'backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:0508@localhost:5432/healthcare_db'
});

function postLogin(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, text: body }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('--- 1. Testing SQL Execution of demo_accounts.sql ---');
  const sql = fs.readFileSync('database/seeds/demo_accounts.sql', 'utf8');
  await pool.query(sql);
  console.log('✅ demo_accounts.sql executed successfully without errors!\n');

  // 2. Verify rows in users
  const usersRes = await pool.query(`
    SELECT id, email, role, name 
    FROM users 
    WHERE email IN (
      'admin@healthcare.com', 
      'patient.john@gmail.com', 
      'patient.sarah@gmail.com', 
      'doctor.sharma@healthcare.com'
    )
    ORDER BY role, email
  `);
  console.log('--- 2. Verified User Accounts in DB ---');
  console.table(usersRes.rows);

  // 3. Verify patients table
  const patientsRes = await pool.query(`
    SELECT p.id, u.email, u.name, p.blood_group, p.emergency_contact 
    FROM patients p 
    JOIN users u ON p.user_id = u.id 
    WHERE u.email IN ('patient.john@gmail.com', 'patient.sarah@gmail.com')
  `);
  console.log('--- 3. Verified Patient Profiles in DB ---');
  console.table(patientsRes.rows);

  // 4. Verify doctor profile for Dr. Rajesh Sharma
  const docRes = await pool.query(`
    SELECT d.id, u.email, u.name, d.specialty, d.city, d.is_verified, d.consultation_fee
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    WHERE u.email = 'doctor.sharma@healthcare.com'
  `);
  console.log('--- 4. Verified Doctor Profile in DB ---');
  console.table(docRes.rows);

  // 5. Test Live Login against backend API on port 5000
  console.log('--- 5. Testing Live API Login with Password123! ---');
  const logins = [
    { email: 'admin@healthcare.com', expectedRole: 'admin' },
    { email: 'patient.john@gmail.com', expectedRole: 'patient' },
    { email: 'patient.sarah@gmail.com', expectedRole: 'patient' },
    { email: 'doctor.sharma@healthcare.com', expectedRole: 'doctor' },
  ];

  for (const item of logins) {
    const res = await postLogin(item.email, 'Password123!');
    if (res.status === 200 && res.body.success && res.body.user?.role === item.expectedRole) {
      console.log(`✅ Login SUCCESS for ${item.email} (Role: ${res.body.user.role}, Token: ${res.body.token ? 'Issued' : 'Missing'})`);
    } else {
      console.error(`❌ Login FAILED for ${item.email}:`, res);
      throw new Error(`Login test failed for ${item.email}`);
    }
  }

  // 6. Test that invalid password fails
  console.log('\n--- 6. Testing Wrong Password Rejection ---');
  const wrongRes = await postLogin('admin@healthcare.com', 'WrongPassword!');
  if (wrongRes.status === 401 && !wrongRes.body.success) {
    console.log('✅ Correctly rejected invalid password with 401 Unauthorized');
  } else {
    throw new Error('Did not reject invalid password');
  }

  console.log('\n🎉 ALL DEMO ACCOUNTS FULLY VERIFIED & WORKING!');
  await pool.end();
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
