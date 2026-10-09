const { Pool } = require('pg');
require('dotenv').config();

/**
 * Database Configuration & Connection Pool
 *
 * Supports both:
 * - Cloud PostgreSQL (Neon / Supabase / Render) via DATABASE_URL with SSL
 * - Local PostgreSQL without SSL
 */

const connectionString = process.env.DATABASE_URL;

const isCloudDatabase = Boolean(
  connectionString && (
    connectionString.includes('neon.tech') ||
    connectionString.includes('supabase.co') ||
    connectionString.includes('render.com') ||
    connectionString.includes('sslmode=require') ||
    process.env.DB_SSL === 'true' ||
    process.env.NODE_ENV === 'production'
  )
);

const poolConfig = {
  connectionString,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
};

if (isCloudDatabase) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(poolConfig);

// Log successful connections
pool.on('connect', () => {
  // Connected client
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

/**
 * Query helper function (uses parameterized queries for SQL injection safety)
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} - Result of the query
 */
const query = (text, params) => pool.query(text, params);

/**
 * Graceful pool closure for shutdown
 */
const closePool = async () => {
  try {
    await pool.end();
    console.log('[DB] PostgreSQL pool closed successfully');
  } catch (err) {
    console.error('[DB] Error closing pool:', err.message);
  }
};

module.exports = {
  query,
  pool,
  closePool
};
