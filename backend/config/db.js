const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || 'alumni'),
  database: process.env.DB_NAME || 'alumni_portal',
});

async function ensureDatabaseSchema() {
  try {
    await pool.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS show_phone_publicly BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS enrollment_number VARCHAR(50),
        ADD COLUMN IF NOT EXISTS city VARCHAR(150),
        ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
        ADD COLUMN IF NOT EXISTS bio TEXT,
        ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
        ADD COLUMN IF NOT EXISTS profile_picture TEXT,
        ADD COLUMN IF NOT EXISTS show_picture_publicly BOOLEAN DEFAULT TRUE;

      ALTER TABLE job_applications
        ADD COLUMN IF NOT EXISTS resume_image_path TEXT;

      ALTER TABLE events
        ADD COLUMN IF NOT EXISTS host VARCHAR(150),
        ADD COLUMN IF NOT EXISTS capacity INT,
        ADD COLUMN IF NOT EXISTS image_url TEXT,
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming',
        ADD COLUMN IF NOT EXISTS event_date_end DATE;

      ALTER TABLE event_registrations
        ADD COLUMN IF NOT EXISTS attendee_type VARCHAR(50),
        ADD COLUMN IF NOT EXISTS designation_or_org VARCHAR(150);

      CREATE TABLE IF NOT EXISTS announcements (
        id           SERIAL PRIMARY KEY,
        title        VARCHAR(255) NOT NULL,
        content      TEXT NOT NULL,
        priority     VARCHAR(20) NOT NULL DEFAULT 'normal',
        status       VARCHAR(20) NOT NULL DEFAULT 'Published',
        created_by   INT REFERENCES users(id) ON DELETE SET NULL,
        created_at   TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Database schema verified');
  } catch (err) {
    console.error('❌ Failed to verify database schema:', err.message);
    throw err;
  }
}

pool.connect()
  .then(async (client) => {
    console.log('✅ PostgreSQL connected');
    client.release();
    await ensureDatabaseSchema();
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  });

module.exports = pool;