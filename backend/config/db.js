const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function ensureDatabaseSchema() {
  try {
    await pool.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS show_phone_publicly BOOLEAN DEFAULT FALSE;

      ALTER TABLE events
        ADD COLUMN IF NOT EXISTS host VARCHAR(150),
        ADD COLUMN IF NOT EXISTS capacity INT,
        ADD COLUMN IF NOT EXISTS image_url TEXT,
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming';
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