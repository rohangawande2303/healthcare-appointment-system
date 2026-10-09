const { query } = require('../config/database');
const bcrypt = require('bcrypt');

async function seed() {
  console.log('--- Seeding Dummy Data (12 Patients, 15 Doctors) ---');

  const passwordHash = '$2b$10$ExR8zS4.NAtf.Z.vS.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v'; // Password123!

  const locations = ['Mumbai', 'Navi Mumbai', 'Pune', 'Thane', 'Mumbai Suburbs', 'Mumbai Central'];
  const specialties = ['Cardiology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Neurology', 'General Practice', 'Dentist', 'ENT'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  try {
    // 0. Clear existing dummy data (optional but helps for re-runs)
    console.log('Clearing old test data...');
    await query("DELETE FROM users WHERE email LIKE '%@test.com'");
    console.log('Cleared successfully.');
    // 1. Seed 15 Doctors
    for (let i = 1; i <= 15; i++) {
      const name = `Dr. Doctor ${i}`;
      const email = `doctor${i}@test.com`;
      const location = locations[Math.floor(Math.random() * locations.length)];
      const specialty = specialties[Math.floor(Math.random() * specialties.length)];
      
      const userRes = await query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [email, passwordHash, name, 'doctor']
      );
      const userId = userRes.rows[0].id;

      await query(
        'INSERT INTO doctors (user_id, specialty, qualification, experience, consultation_fee, location, availability_json, bio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          userId, 
          specialty, 
          'MBBS, Specialized', 
          Math.floor(Math.random() * 20) + 2, 
          (Math.floor(Math.random() * 10) + 3) * 100, 
          location,
          JSON.stringify({
            monday: ["09:00", "10:00", "11:00"],
            tuesday: ["09:00", "10:00", "11:00"],
            wednesday: ["09:00", "10:00", "11:00"],
            thursday: ["09:00", "10:00", "11:00"],
            friday: ["09:00", "10:00", "11:00"]
          }),
          `Passionate ${specialty} specialist in ${location}.`
        ]
      );
      console.log(`Seeded Doctor: ${email} in ${location}`);
    }

    // 2. Seed 12 Patients
    for (let i = 1; i <= 12; i++) {
      const name = `Patient ${i}`;
      const email = `patient${i}@test.com`;
      
      const userRes = await query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [email, passwordHash, name, 'patient']
      );
      const userId = userRes.rows[0].id;

      await query(
        'INSERT INTO patients (user_id, date_of_birth, blood_group, medical_history_json) VALUES ($1, $2, $3, $4)',
        [
          userId, 
          '1990-01-01', 
          bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
          JSON.stringify({ allergies: ['None'], previous_surgeries: [] })
        ]
      );
      console.log(`Seeded Patient: ${email}`);
    }

    console.log('--- Seeding Completed Successfully ---');
  } catch (err) {
    console.error('--- Seeding Failed ---', err);
  } finally {
    process.exit(0);
  }
}

seed();
