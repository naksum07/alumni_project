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
-- The hash below is for 'AdminPass123!' — regenerate if needed.
INSERT INTO users (full_name, email, phone, password_hash, role, department, graduation_year, job_title, company, is_approved, status)
VALUES
('System Administrator', 'admin@alumni.com', '+91 9876500000', '$2b$10$Ky7HClFaLJW3cGHHOA1C5ud4dG8PZVNqPTLpaZfjboSLl3dCa7LDy', 'admin', 'Computer Science', 2018, 'Portal Administrator', 'AlumniConnect', true, 'active')
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


-- Seed 20 Announcements
INSERT INTO announcements (title, content, priority, status)
VALUES
('Campus-Wide Annual Alumni Meet 2026 Registration Open', 'We are thrilled to announce that registration for the Annual Alumni Meet 2026 is officially open! Join us for a weekend of nostalgia, networking, keynotes from distinguished alumni, and department tours. Early bird registrations receive exclusive alumni merchandise.', 'urgent', 'Published'),
('Global Alumni Mentorship Program 2026-2027 Cohort', 'Applications are now open for the 2026 Mentorship Program. Alumni with 3+ years of professional experience are invited to mentor final-year students in software engineering, data science, finance, and management. Matchings begin next month.', 'normal', 'Published'),
('New Innovation & Entrepreneurship Incubation Grant Announced', 'The Alumni Foundation has partnered with the College Incubation Center to offer $50,000 in seed grants for student and alumni tech startups. Submissions close on October 15th. Detailed guidelines are available in the Portal Resources section.', 'urgent', 'Published'),
('Distinguished Alumni Awards 2026 Nominations', 'Nominate outstanding alumni who have demonstrated exceptional leadership, professional excellence, or service to society. Categories include Young Achiever, Innovation in Tech, and Lifetime Achievement. Deadline for nominations is November 1st.', 'normal', 'Published'),
('Launch of Alumni Connect Mobile Portal & Directory Upgrades', 'We have updated our portal with advanced search filters, direct messaging capability, and verified alumni badges. Ensure your profile details, current organization, and LinkedIn links are updated to get discovered.', 'normal', 'Published'),
('Fall 2026 Campus Recruitment & Alumni Referral Drive', 'Alumni working at top global tech and corporate firms are invited to submit job openings and conduct referral interviews for graduating seniors. Over 40 companies have registered for the upcoming fall drive.', 'urgent', 'Published'),
('Special Guest Lecture Series: Artificial Intelligence & Future of Work', 'Join Dr. Rajesh Kumar (Batch of 2012, AI Research Lead at Tech Global) as he delivers a keynote address on Generative AI and career choices in 2026. Free registration for all current students and registered alumni.', 'normal', 'Published'),
('Campus Library & Research Digital Access for Alumni', 'The institution is pleased to extend lifetime digital access to IEEE, ACM Digital Library, and JSTOR research publications for all verified alumni network members. Login through your registered portal credentials.', 'normal', 'Published'),
('Alumni Association Board Election Results 2026', 'The votes have been tallied for the 2026-2028 Alumni Association Executive Committee. We congratulate the newly elected office bearers and thank all members who participated in the democratic process.', 'low', 'Published'),
('Annual Sports & Athletic Alumni Championship', 'Dust off your sports gear! The annual Alumni vs Student Cricket, Football, and Basketball tournament will take place on campus grounds. Team registrations close this Friday.', 'normal', 'Published'),
('Women in Tech & Leadership Networking Summit', 'A special half-day summit focusing on breaking barriers, executive leadership, and mentorship for women in STEM fields. Panelists feature leaders from Microsoft, Amazon, and leading startups.', 'urgent', 'Published'),
('Alumni Endowment Fund Reaches $2 Million Milestone', 'Thanks to generous contributions from our global alumni community, the Student Scholarship Endowment Fund has reached $2 million. This will fund full scholarships for 50 deserving undergraduate students this academic year.', 'normal', 'Published'),
('Career Pivot & Transition Workshop for Mid-Career Alumni', 'Looking to transition into Product Management, Data Engineering, or Executive Leadership? Join our interactive 2-day virtual workshop facilitated by senior industry experts.', 'low', 'Published'),
('Campus Infrastructure Expansion: New Science & Tech Block Inauguration', 'Alumni are invited to attend the virtual inauguration ceremony of the state-of-the-art Science & Technology Research Block, made possible by major donations from the Class of 2005.', 'normal', 'Published'),
('International Alumni Chapter Meets: San Francisco & London', 'Local chapter meetups are happening next weekend in Silicon Valley (Palo Alto) and London (Canary Wharf). Reconnect with fellow alumni living and working abroad!', 'normal', 'Published'),
('Urgent Appeal: Community Outreach & Student Emergency Fund Drive', 'The Alumni Community Impact Team is organizing a support drive and emergency grant taskforce to assist underprivileged students. Voluntary donations and remote mentoring opportunities are open.', 'urgent', 'Published'),
('Spring 2027 Research Internship Openings for Pre-Final Year Students', 'Alumni research labs at MIT, Stanford, and IISc are offering summer 2027 research internships exclusively for students of our institute. Check the Jobs & Internships section for details.', 'normal', 'Published'),
('Annual Alumni Chronicle & Memories Publication Call for Submissions', 'Share your high-res photos, campus memories, and updates for the 2026 Edition of the Alumni Chronicle. Submissions accepted until October 30.', 'low', 'Published'),
('Cyber Security & Data Privacy Awareness Masterclass', 'Learn modern data protection strategies, cloud compliance, and security best practices from CISOs among our alumni network in this free weekend masterclass.', 'normal', 'Published'),
('Year-End Grand Networking Gala & Cultural Evening', 'Mark your calendars for December 20, 2026. An enchanting evening of dinner, cultural performances, musical bands, and networking at Grand Heritage Ballroom.', 'urgent', 'Published')
ON CONFLICT DO NOTHING;

-- Seed 20 Events
INSERT INTO events (name, event_date, event_date_end, event_time, venue, host, status, description)
VALUES
('Annual Alumni Homecoming Meet 2026', '2026-09-25', '2026-09-27', '09:00 AM - 06:00 PM', 'Main College Campus Auditorium', 'Alumni Association & Dean Office', 'upcoming', 'A flagship 3-day event reconnecting alumni across all graduating batches. Includes keynote speeches, campus tours, department showcases, gala dinner, and cultural performances.'),
('Global Career & Startup Expo 2026', '2026-10-05', '2026-10-06', '10:00 AM - 05:00 PM', 'College Multipurpose Convention Center', 'Placement Cell & Alumni Network', 'upcoming', 'Over 50 companies and alumni-led startups hire for full-time roles and internships. Interactive booth sessions, resume reviews, and spot interview rounds.'),
('AI & Cloud Engineering Tech Summit', '2026-10-15', '2026-10-15', '11:00 AM - 04:00 PM', 'Virtual (Zoom & YouTube Live)', 'Computer Science Alumni Chapter', 'upcoming', 'Deep dive into LLMs, MLOps, Kubernetes, and Serverless architectures. Features tech talks by senior architects from Google, AWS, and Microsoft.'),
('Women Leadership in Tech Workshop', '2026-10-22', '2026-10-22', '02:00 PM - 06:00 PM', 'Seminar Hall B, Admin Building', 'Women in Tech Forum', 'upcoming', 'Empowering future leaders through talks on salary negotiation, executive presence, overcoming burnout, and navigating career growth in corporate environments.'),
('Alumni Founders Pitch & Venture Night', '2026-11-02', '2026-11-02', '05:00 PM - 09:00 PM', 'Innovation Hub Auditorium', 'Alumni Angel Syndicate', 'upcoming', '10 selected student and alumni startups pitch their innovative products to top VC investors and angel networks for seed funding up to $100K.'),
('Annual Inter-Batch Alumni Cricket & Football Cup', '2026-11-12', '2026-11-14', '08:00 AM - 05:00 PM', 'Sports Ground & Stadium', 'Sports Council', 'upcoming', 'Exciting sports tournament featuring teams from different graduation decades (2000s, 2010s, 2020s) competing against current college varsity teams.'),
('Cybersecurity & Ethical Hacking Masterclass', '2026-11-20', '2026-11-20', '10:00 AM - 02:00 PM', 'Computer Lab 4 & Virtual Stream', 'Dept of Information Technology', 'upcoming', 'Hands-on workshop on network security, zero-trust architecture, red teaming, and bug bounty strategies led by industry cybersecurity veterans.'),
('Higher Studies & Foreign University Guidance Webinar', '2026-12-01', '2026-12-01', '06:00 PM - 08:30 PM', 'Virtual (Google Meet)', 'International Student Cell', 'upcoming', 'Alumni currently studying at MIT, Oxford, CMU, and ETH Zurich share tips on GRE/TOEFL preparation, SOP writing, scholarship applications, and visa processes.'),
('Civil & Electrical Engineering Innovations Conference', '2026-12-10', '2026-12-11', '09:30 AM - 04:30 PM', 'Mechanical Engineering Conference Room', 'Engineering Alumni Chapter', 'upcoming', 'Exploring sustainable infrastructure, smart grids, renewable energy systems, and green building technologies with industry pioneers.'),
('Grand Winter Charity Ball & Cultural Night', '2026-12-20', '2026-12-20', '06:30 PM - 11:00 PM', 'Grand Imperial Hotel Ballroom', 'Alumni Philanthropy Committee', 'upcoming', 'An elegant evening featuring live orchestra, fine dining, silent auction, and awards presentation honoring key donors and community contributors.'),
('Finance & Quantitative Trading Bootcamp', '2027-01-10', '2027-01-11', '10:00 AM - 03:30 PM', 'Financial Analytics Lab', 'Economics & Finance Club', 'upcoming', 'Master algorithmic trading, risk management, fintech models, and portfolio optimization techniques taught by Wall Street and Dalal Street alumni.'),
('Product Management & UX Design Hackathon', '2027-01-22', '2027-01-24', '09:00 AM - 09:00 PM', 'Student Activity Center', 'Design & Product Club', 'upcoming', '48-hour challenge to design solutions for real-world business problems. Cash prizes of $5,000 for winning product teardown and prototype designs.'),
('Healthcare & BioTech Frontier Symposium', '2027-02-05', '2027-02-05', '10:00 AM - 04:00 PM', 'Medical Sciences Block Auditorium', 'Healthcare Alumni Special Interest Group', 'upcoming', 'Discover breakthrough research in personalized medicine, bioinformatics, medical AI diagnostics, and biomedical device manufacturing.'),
('Alumni Mentorship Speed Networking Night', '2027-02-18', '2027-02-18', '05:30 PM - 08:30 PM', 'Central Campus Lawn & Gazebo', 'Alumni Mentorship Council', 'upcoming', 'Fast-paced 1-on-1 interaction sessions allowing final year students to rotate through 8 senior alumni mentors for quick feedback and career advice.'),
('Renewable Energy & CleanTech Summit 2027', '2027-03-02', '2027-03-03', '09:00 AM - 05:00 PM', 'Green Energy Research Pavilion', 'Sustainable Tech Alumni Taskforce', 'upcoming', 'Focused on EV technology, battery storage, solar innovation, and carbon capture solutions transforming global energy systems.'),
('Data Science & Big Data Architecture Masterclass', '2027-03-15', '2027-03-15', '10:00 AM - 03:00 PM', 'Virtual (MS Teams)', 'Data Engineering Alumni Group', 'upcoming', 'Technical deep-dive into Snowflake, Databricks, Spark pipelines, and data governance for enterprise-scale systems.'),
('Creative Arts, Film & Media Alumni Showcase', '2027-03-28', '2027-03-28', '04:00 PM - 09:00 PM', 'Campus Open Air Theatre (OAT)', 'Media & Fine Arts Society', 'upcoming', 'Screening of short films, documentary premieres, art exhibitions, and panel talks with alumni working in film production and digital media.'),
('Mid-Career Leadership & Executive Development Seminar', '2027-04-10', '2027-04-10', '09:30 AM - 01:30 PM', 'Executive Education Center', 'Business School Alumni Forum', 'upcoming', 'Designed for alumni with 5-15 years experience transitioning to VP, Director, and C-Suite roles. Covers strategic decision making and org transformation.'),
('Global Alumni Virtual Coffee Connect (Spring Edition)', '2027-04-22', '2027-04-22', '07:00 PM - 09:00 PM', 'Gather.town Virtual Lounge', 'Global Alumni Engagement Team', 'upcoming', 'Informal virtual lounge meet for alumni across North America, Europe, Asia-Pacific, and Middle East to network in thematic virtual rooms.'),
('Class of 2016 10-Year Milestone Reunion', '2027-05-08', '2027-05-09', '10:00 AM - 08:00 PM', 'Main Campus Grounds & Alumni House', 'Class of 2016 Steering Committee', 'upcoming', 'A celebratory 10-year reunion for the batch of 2016 featuring nostalgic slide shows, faculty felicitations, campus tours, and celebratory banquet.')
ON CONFLICT DO NOTHING;
