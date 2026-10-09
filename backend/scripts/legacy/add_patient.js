/**
 * add_patient.js
 * Creates the patient user rohan@gmail.com with password rohanhealth1234
 * and a patient profile, then reports all users in the DB.
 * 
 * Run from /backend:  node add_patient.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('Connected to database:', process.env.DATABASE_URL);

    // ── 1. List existing users ──────────────────────────────────
    const existing = await client.query('SELECT id, email, name, role FROM users ORDER BY id');
    console.log('\n── Existing users ───────────────────────────────────');
    console.table(existing.rows);

    // ── 2. Check if rohan@gmail.com already exists ───────────────
    const check = await client.query("SELECT id, email, name, role FROM users WHERE email = $1", ['rohan@gmail.com']);
    if (check.rows.length > 0) {
      console.log('\nUser rohan@gmail.com already exists:', check.rows[0]);
      // Update password to make sure it matches
      const newHash = await bcrypt.hash('rohanhealth1234', 10);
      await client.query("UPDATE users SET password_hash = $1 WHERE email = $2", [newHash, 'rohan@gmail.com']);
      console.log('Password updated to: rohanhealth1234');
    } else {
      // ── 3. Create the user ──────────────────────────────────────
      const passwordHash = await bcrypt.hash('rohanhealth1234', 10);
      const userResult = await client.query(
        "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role",
        ['rohan@gmail.com', passwordHash, 'Rohan Patil', 'patient']
      );
      const newUser = userResult.rows[0];
      console.log('\n✅ Created user:', newUser);

      // ── 4. Create patient profile ───────────────────────────────
      await client.query(
        "INSERT INTO patients (user_id, date_of_birth, blood_group, medical_history_json) VALUES ($1, $2, $3, $4)",
        [
          newUser.id,
          '1998-05-15',
          'B+',
          JSON.stringify({ allergies: [], previous_surgeries: [] })
        ]
      );
      console.log('✅ Created patient profile for user id:', newUser.id);
    }

    // ── 5. Verify login works (bcrypt check) ────────────────────
    const loginCheck = await client.query("SELECT password_hash FROM users WHERE email = $1", ['rohan@gmail.com']);
    const isValid = await bcrypt.compare('rohanhealth1234', loginCheck.rows[0].password_hash);
    console.log('\n🔐 Password verification for rohanhealth1234:', isValid ? '✅ VALID' : '❌ INVALID');

    // ── 6. Final users list ─────────────────────────────────────
    const final = await client.query('SELECT id, email, name, role FROM users ORDER BY id');
    console.log('\n── All users now ───────────────────────────────────');
    console.table(final.rows);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('LOGIN CREDENTIALS FOR TESTING:');
    console.log('  Email   : rohan@gmail.com');
    console.log('  Password: rohanhealth1234');
    console.log('  Role    : patient');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
