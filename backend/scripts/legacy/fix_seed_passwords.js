/**
 * fix_seed_passwords.js
 * 
 * The sample_data.sql used a placeholder/invalid bcrypt hash for all seeded users.
 * This script generates a REAL hash for 'Password123!' and updates ALL seeded users
 * so they can actually log in with that password.
 * 
 * Run from /backend: node fix_seed_passwords.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('Fixing seeded user passwords...\n');
    
    // Generate a proper bcrypt hash for 'Password123!'
    const hash = await bcrypt.hash('Password123!', 10);
    
    // Update all seeded users (those with the placeholder hash)
    const result = await client.query(
      `UPDATE users 
       SET password_hash = $1
       WHERE email IN (
         'admin@healthcare.com',
         'doctor.sharma@healthcare.com',
         'doctor.patel@healthcare.com',
         'doctor.verma@healthcare.com',
         'doctor.reddy@healthcare.com',
         'doctor.khan@healthcare.com',
         'patient.john@gmail.com'
       )
       RETURNING id, email, role`,
      [hash]
    );
    
    console.log(`✅ Updated ${result.rowCount} users with password: Password123!`);
    console.table(result.rows);

    // Verify
    const verify = await bcrypt.compare('Password123!', hash);
    console.log('\n🔐 Hash verification:', verify ? '✅ VALID' : '❌ INVALID');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ALL WORKING LOGIN CREDENTIALS:');
    console.log('');
    console.log('  PATIENT:');
    console.log('    Email:    rohan@gmail.com');
    console.log('    Password: rohanhealth1234');
    console.log('');
    console.log('    Email:    patient.john@gmail.com');
    console.log('    Password: Password123!');
    console.log('');
    console.log('  DOCTOR:');
    console.log('    Email:    doctor.sharma@healthcare.com');
    console.log('    Password: Password123!');
    console.log('');
    console.log('  ADMIN:');
    console.log('    Email:    admin@healthcare.com');
    console.log('    Password: Password123!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
