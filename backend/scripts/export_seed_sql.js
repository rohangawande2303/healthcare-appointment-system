const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:0508@localhost:5432/healthcare_db' });

const BCRYPT_HASH_PASSWORD123 = '$2b$10$pm2bNh6befvP6AbRVMaI3O.zOGNmFvdo3S92PYopyufZyJe.60xF.';

async function exportSQL() {
  const client = await pool.connect();
  try {
    // 1. Fetch only genuine doctors (exclude automated test users)
    const usersRes = await client.query(`
      SELECT DISTINCT u.* 
      FROM users u
      JOIN doctors d ON d.user_id = u.id
      WHERE u.role = 'doctor' 
        AND u.email NOT LIKE 'doctor_%@example.com'
      ORDER BY u.id ASC
    `);

    // 2. Fetch doctors with their associated user email
    const docsRes = await client.query(`
      SELECT d.*, u.email AS doctor_email
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE u.role = 'doctor' 
        AND u.email NOT LIKE 'doctor_%@example.com'
      ORDER BY d.id ASC
    `);

    let sql = `-- ====================================================================\n`;
    sql += `-- HEALTHCARE APPOINTMENT SYSTEM: DOCTORS SEED DATASET\n`;
    sql += `-- 125 Realistic Doctors across 10 Major Indian Cities with OpenStreetMap coordinates\n`;
    sql += `-- Safe to run multiple times: uses ON CONFLICT DO UPDATE\n`;
    sql += `-- Password for all doctor accounts: Password123!\n`;
    sql += `-- ====================================================================\n\n`;

    // Users
    sql += `-- 1. Insert Doctor User Accounts (${usersRes.rows.length} total)\n`;
    usersRes.rows.forEach(u => {
      const email = u.email.replace(/'/g, "''");
      const name = u.name.replace(/'/g, "''");
      sql += `INSERT INTO users (email, password_hash, name, role) VALUES ('${email}', '${BCRYPT_HASH_PASSWORD123}', '${name}', 'doctor') ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;\n`;
    });

    // Doctors
    sql += `\n-- 2. Insert Doctor Profiles (${docsRes.rows.length} total)\n`;
    docsRes.rows.forEach(d => {
      const spec = d.specialty.replace(/'/g, "''");
      const qual = d.qualification.replace(/'/g, "''");
      const bio = (d.bio || '').replace(/'/g, "''");
      const city = (d.city || 'Mumbai').replace(/'/g, "''");
      const loc = (d.location || '').replace(/'/g, "''");
      const lang = (d.languages || 'English, Hindi').replace(/'/g, "''");
      const sched = JSON.stringify(d.availability_json || {}).replace(/'/g, "''");
      const email = d.doctor_email.replace(/'/g, "''");

      sql += `INSERT INTO doctors (user_id, specialty, qualification, experience, consultation_fee, availability_json, bio, city, location, latitude, longitude, rating, languages, is_verified)\n`;
      sql += `SELECT id, '${spec}', '${qual}', ${d.experience}, ${d.consultation_fee}, '${sched}', '${bio}', '${city}', '${loc}', ${d.latitude !== null ? d.latitude : 'NULL'}, ${d.longitude !== null ? d.longitude : 'NULL'}, ${d.rating || 4.8}, '${lang}', true\n`;
      sql += `FROM users WHERE email = '${email}'\n`;
      sql += `ON CONFLICT (user_id) DO UPDATE SET specialty = EXCLUDED.specialty, qualification = EXCLUDED.qualification, experience = EXCLUDED.experience, consultation_fee = EXCLUDED.consultation_fee, availability_json = EXCLUDED.availability_json, bio = EXCLUDED.bio, city = EXCLUDED.city, location = EXCLUDED.location, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, rating = EXCLUDED.rating, languages = EXCLUDED.languages, is_verified = EXCLUDED.is_verified;\n\n`;
    });

    const targetPath = path.join(__dirname, '../../database/seeds/doctors_data.sql');
    fs.writeFileSync(targetPath, sql, 'utf8');
    console.log(`✅ Successfully exported ${docsRes.rows.length} doctors and ${usersRes.rows.length} doctor users to ${targetPath}`);

  } catch (err) {
    console.error('Export error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

exportSQL();
