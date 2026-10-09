const { Pool } = require('../backend/node_modules/pg');
const path = require('path');
require('../backend/node_modules/dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log('Running database schema updates...');
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE doctors ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Mumbai';
      ALTER TABLE doctors ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT 'Hitech Medical Center';
      ALTER TABLE doctors ADD COLUMN IF NOT EXISTS latitude DECIMAL(9, 6);
      ALTER TABLE doctors ADD COLUMN IF NOT EXISTS longitude DECIMAL(9, 6);
      ALTER TABLE doctors ADD COLUMN IF NOT EXISTS rating DECIMAL(2, 1) DEFAULT 4.8;
      ALTER TABLE doctors ADD COLUMN IF NOT EXISTS languages VARCHAR(255) DEFAULT 'English, Hindi';
      CREATE INDEX IF NOT EXISTS idx_doctors_city ON doctors(city);
      CREATE INDEX IF NOT EXISTS idx_doctors_location ON doctors(location);
    `);
    console.log('✅ Doctors table updated with location and rating columns successfully!');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
