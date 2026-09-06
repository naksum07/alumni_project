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
    is_approved     BOOLEAN DEFAULT TRUE,
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Migrations/Alter statements for existing database instances:
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_phone_publicly BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS enrollment_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_picture_publicly BOOLEAN DEFAULT TRUE;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS resume_image_path TEXT;

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
    event_time   VARCHAR(50),
    venue        VARCHAR(150),
    description  TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

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
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS attendee_type VARCHAR(50);
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS designation_or_org VARCHAR(150);

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
    applied_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
    id          SERIAL PRIMARY KEY,
    user_id     INT REFERENCES users(id) ON DELETE SET NULL,
    rating      INT CHECK (rating >= 1 AND rating <= 5),
    message     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed initial events
INSERT INTO events (name, event_date, event_time, venue, description)
VALUES
('Annual Alumni Meet', '2026-08-15', '10:00 AM - 5:00 PM', 'College Auditorium', 'A special gathering where alumni, students, and faculty members connect and celebrate memories.'),
('Annual Career Fair', '2026-09-20', '9:30 AM - 4:30 PM', 'College Seminar Hall', 'Meet top companies, explore career opportunities, attend interviews, and connect with recruiters.'),
('Alumni Networking Session', '2026-10-10', '11:00 AM - 3:00 PM', 'College Conference Hall', 'Connect with alumni, industry professionals, and students to exchange ideas and explore career opportunities.')
ON CONFLICT DO NOTHING;

-- Seed default Admin user (password: AdminPass123!)
INSERT INTO users (full_name, email, phone, password_hash, role, department, graduation_year, job_title, company, is_approved, status)
VALUES
('System Administrator', 'admin@alumni.com', '+91 9876500000', '$2b$10$xTRTsVGI0QxizvtS7sltl.S/qeokEI/DPNyzhIX4GpHVJlD6X.zBW', 'admin', 'Computer Science', 2018, 'Portal Administrator', 'AlumniConnect', true, 'active')
ON CONFLICT (email) DO NOTHING;


-- Add new fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS host VARCHAR(150);
ALTER TABLE events ADD COLUMN IF NOT EXISTS capacity INT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming';
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_date_end DATE;

CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url TEXT,
    publish_date TIMESTAMP NOT NULL DEFAULT NOW(),
    visibility VARCHAR(50) NOT NULL DEFAULT 'Everyone',
    status VARCHAR(20) NOT NULL DEFAULT 'Published',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(50);

CREATE TABLE IF NOT EXISTS announcements (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    content      TEXT NOT NULL,
    priority     VARCHAR(20) NOT NULL DEFAULT 'normal',
    status       VARCHAR(20) NOT NULL DEFAULT 'Published',
    created_by   INT REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS success_stories (
    id          SERIAL PRIMARY KEY,
    alumni_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    story_text  TEXT NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);




CREATE TABLE IF NOT EXISTS community_posts (
    id           SERIAL PRIMARY KEY,
    user_id      INT REFERENCES users(id) ON DELETE CASCADE,
    author_name  VARCHAR(150),
    role         VARCHAR(50),
    affiliation  VARCHAR(255),
    category     VARCHAR(50) NOT NULL DEFAULT 'General',
    title        VARCHAR(255) NOT NULL,
    content      TEXT NOT NULL,
    likes        INT NOT NULL DEFAULT 0,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS community_comments (
    id           SERIAL PRIMARY KEY,
    post_id      INT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id      INT REFERENCES users(id) ON DELETE CASCADE,
    author_name  VARCHAR(150),
    role         VARCHAR(50),
    content      TEXT NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
ALTER TABLE community_comments ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE community_comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

