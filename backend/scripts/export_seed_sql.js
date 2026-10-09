const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function exportSQL() {
  const client = await pool.connect();
  try {
    const usersRes = await client.query("SELECT * FROM users WHERE role = 'doctor' ORDER BY id ASC");
    const docsRes = await client.query("SELECT * FROM doctors ORDER BY id ASC");

    let sql = `-- ====================================================================\n`;
    sql += `-- 120+ REALISTIC SEED DOCTORS WITH OPENSTREETMAP LOCATIONS\n`;
    sql += `-- Safe to run multiple times: uses ON CONFLICT DO UPDATE\n`;
    sql += `-- ====================================================================\n\n`;

    // Users
    sql += `-- 1. Insert Doctor User Accounts (Password is 'Password123!')\n`;
    usersRes.rows.forEach(u => {
      const email = u.email.replace(/'/g, "''");
      const name = u.name.replace(/'/g, "''");
      const pwd = u.password_hash.replace(/'/g, "''");
      sql += `INSERT INTO users (email, password_hash, name, role) VALUES ('${email}', '${pwd}', '${name}', 'doctor') ON CONFLICT (email) DO NOTHING;\n`;
    });

    // Doctors
    sql += `\n-- 2. Insert Doctor Profiles\n`;
    docsRes.rows.forEach(d => {
      const spec = d.specialty.replace(/'/g, "''");
      const qual = d.qualification.replace(/'/g, "''");
      const bio = (d.bio || '').replace(/'/g, "''");
      const city = (d.city || 'Mumbai').replace(/'/g, "''");
      const loc = (d.location || '').replace(/'/g, "''");
      const lang = (d.languages || 'English, Hindi').replace(/'/g, "''");
      const sched = JSON.stringify(d.availability_json || {}).replace(/'/g, "''");

      sql += `INSERT INTO doctors (user_id, specialty, qualification, experience, consultation_fee, availability_json, bio, city, location, latitude, longitude, rating, languages, is_verified)\n`;
      sql += `SELECT id, '${spec}', '${qual}', ${d.experience}, ${d.consultation_fee}, '${sched}', '${bio}', '${city}', '${loc}', ${d.latitude || 'NULL'}, ${d.longitude || 'NULL'}, ${d.rating || 4.8}, '${lang}', true\n`;
      sql += `FROM users WHERE email = (SELECT email FROM users WHERE id = ${d.user_id})\n`;
      sql += `ON CONFLICT (user_id) DO UPDATE SET city = EXCLUDED.city, location = EXCLUDED.location, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, rating = EXCLUDED.rating, languages = EXCLUDED.languages;\n\n`;
    });

    const targetPath = path.join(__dirname, '../../database/seeds/doctors_data.sql');
    fs.writeFileSync(targetPath, sql, 'utf8');
    console.log(`✅ Successfully exported ${usersRes.rows.length} doctors to ${targetPath}`);

  } catch (err) {
    console.error('Export error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

exportSQL();
