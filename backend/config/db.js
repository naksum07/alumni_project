const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')
        ? false
        : { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: String(process.env.DB_PASSWORD || 'alumni'),
      database: process.env.DB_NAME || 'alumni_portal',
    };

const pool = new Pool(poolConfig);

async function ensureDatabaseSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id              SERIAL PRIMARY KEY,
        full_name       VARCHAR(150) NOT NULL,
        email           VARCHAR(150) UNIQUE NOT NULL,
        phone           VARCHAR(20),
        password_hash   TEXT NOT NULL,
        role            VARCHAR(20) NOT NULL DEFAULT 'student',
        department      VARCHAR(100),
        graduation_year INT,
        job_title       VARCHAR(150),
        company         VARCHAR(150),
        enrollment_number VARCHAR(50),
        city            VARCHAR(150),
        linkedin_url    TEXT,
        bio             TEXT,
        gender          VARCHAR(50),
        profile_picture TEXT,
        show_phone_publicly BOOLEAN DEFAULT FALSE,
        show_picture_publicly BOOLEAN DEFAULT TRUE,
        is_approved     BOOLEAN DEFAULT TRUE,
        status          VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at      TIMESTAMP NOT NULL DEFAULT NOW()
      );

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

      CREATE TABLE IF NOT EXISTS password_resets (
        id          SERIAL PRIMARY KEY,
        user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token       TEXT NOT NULL,
        expires_at  TIMESTAMP NOT NULL,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);

      CREATE TABLE IF NOT EXISTS events (
        id           SERIAL PRIMARY KEY,
        name         VARCHAR(150) NOT NULL,
        event_date   DATE NOT NULL,
        event_date_end DATE,
        event_time   VARCHAR(50),
        venue        VARCHAR(150),
        host         VARCHAR(150),
        capacity     INT,
        image_url    TEXT,
        status       VARCHAR(20) DEFAULT 'upcoming',
        description  TEXT,
        created_at   TIMESTAMP NOT NULL DEFAULT NOW()
      );

      ALTER TABLE events
        ADD COLUMN IF NOT EXISTS host VARCHAR(150),
        ADD COLUMN IF NOT EXISTS capacity INT,
        ADD COLUMN IF NOT EXISTS image_url TEXT,
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming',
        ADD COLUMN IF NOT EXISTS event_date_end DATE;

      CREATE TABLE IF NOT EXISTS event_registrations (
        id           SERIAL PRIMARY KEY,
        event_id     INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id      INT REFERENCES users(id) ON DELETE SET NULL,
        full_name    VARCHAR(150) NOT NULL,
        email        VARCHAR(150) NOT NULL,
        phone        VARCHAR(20),
        attendee_type VARCHAR(50),
        designation_or_org VARCHAR(150),
        message      TEXT,
        registered_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      ALTER TABLE event_registrations
        ADD COLUMN IF NOT EXISTS attendee_type VARCHAR(50),
        ADD COLUMN IF NOT EXISTS designation_or_org VARCHAR(150);

      CREATE TABLE IF NOT EXISTS jobs (
        id           SERIAL PRIMARY KEY,
        posted_by    INT REFERENCES users(id) ON DELETE SET NULL,
        title        VARCHAR(150) NOT NULL,
        company      VARCHAR(150) NOT NULL,
        location     VARCHAR(150),
        job_type     VARCHAR(50),
        salary       VARCHAR(100),
        skills       TEXT,
        description  TEXT,
        status       VARCHAR(20) NOT NULL DEFAULT 'open',
        created_at   TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS job_applications (
        id            SERIAL PRIMARY KEY,
        job_id        INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        applicant_id  INT REFERENCES users(id) ON DELETE SET NULL,
        full_name     VARCHAR(150) NOT NULL,
        email         VARCHAR(150) NOT NULL,
        phone         VARCHAR(20),
        cover_letter  TEXT,
        resume_url    TEXT,
        resume_image_path TEXT,
        applied_at    TIMESTAMP NOT NULL DEFAULT NOW()
      );

      ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS resume_image_path TEXT;

      CREATE TABLE IF NOT EXISTS feedback (
        id          SERIAL PRIMARY KEY,
        user_id     INT REFERENCES users(id) ON DELETE SET NULL,
        rating      INT CHECK (rating >= 1 AND rating <= 5),
        message     TEXT NOT NULL,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS news (
        id           SERIAL PRIMARY KEY,
        title        VARCHAR(255) NOT NULL,
        content      TEXT NOT NULL,
        category     VARCHAR(50) NOT NULL,
        image_url    TEXT,
        publish_date TIMESTAMP NOT NULL DEFAULT NOW(),
        visibility   VARCHAR(50) NOT NULL DEFAULT 'Everyone',
        status       VARCHAR(20) NOT NULL DEFAULT 'Published',
        created_at   TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id           SERIAL PRIMARY KEY,
        title        VARCHAR(255) NOT NULL,
        content      TEXT NOT NULL,
        priority     VARCHAR(20) NOT NULL DEFAULT 'normal',
        status       VARCHAR(20) NOT NULL DEFAULT 'Published',
        created_by   INT REFERENCES users(id) ON DELETE SET NULL,
        created_at   TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Seed default Admin user (password: AdminPass123!)
      INSERT INTO users (full_name, email, phone, password_hash, role, department, graduation_year, job_title, company, is_approved, status)
      VALUES
      ('System Administrator', 'admin@alumni.com', '+91 9876500000', '$2b$10$Ky7HClFaLJW3cGHHOA1C5ud4dG8PZVNqPTLpaZfjboSLl3dCa7LDy', 'admin', 'Computer Science', 2018, 'Portal Administrator', 'AlumniConnect', true, 'active')
      ON CONFLICT (email) DO NOTHING;
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