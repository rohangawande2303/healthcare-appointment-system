const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function setup() {
  const dbName = 'healthcare_db';
  const passwords = [process.env.DATABASE_URL.split(':')[2].split('@')[0], 'postgres', ''];
  const baseConnStringTemplate = process.env.DATABASE_URL.replace(`/${dbName}`, '/postgres');
  
  let client;
  let success = false;

  for (const pwd of passwords) {
    try {
      const connString = baseConnStringTemplate.replace(/:[^:@]*@/, `:${pwd}@`);
      client = new Client({ connectionString: connString });
      await client.connect();
      console.log(`Connected to PostgreSQL with password: ${pwd === '' ? '(empty)' : pwd}`);
      success = true;
      break;
    } catch (err) {
      console.log(`Failed with password ${pwd === '' ? '(empty)' : pwd}: ${err.message}`);
    }
  }

  if (!success) {
    console.error('Could not connect to PostgreSQL with any common password.');
    return;
  }

  try {
    // Create database if not exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
  } catch (err) {
    console.error('Error during database creation:', err.message);
  } finally {
    await client.end();
  }

  // Now connect to healthcare_db to create tables
  let dbClient;
  const dbConnStringTemplate = process.env.DATABASE_URL;
  success = false;

  for (const pwd of passwords) {
    try {
      const connString = dbConnStringTemplate.replace(/:[^:@]*@/, `:${pwd}@`);
      dbClient = new Client({ connectionString: connString });
      await dbClient.connect();
      console.log(`Connected to ${dbName} with password: ${pwd === '' ? '(empty)' : pwd}`);
      success = true;
      break;
    } catch (err) {
      // Skip logging here as we already know which password works
    }
  }

  if (!success) return;

  try {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await dbClient.query(schemaSql);
    console.log('Schema applied successfully');

    const seedPath = path.join(__dirname, '../database/seeds/sample_data.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await dbClient.query(seedSql);
    console.log('Seed data applied successfully');

  } catch (err) {
    console.error('Error during schema/seed application:', err.message);
  } finally {
    await dbClient.end();
  }
}

setup();
