require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'alumni',
  database: process.env.DB_NAME || 'alumni_portal',
});

const ANNOUNCEMENTS = [
  {
    title: 'Campus-Wide Annual Alumni Meet 2026 Registration Open',
    content: 'We are thrilled to announce that registration for the Annual Alumni Meet 2026 is officially open! Join us for a weekend of nostalgia, networking, keynotes from distinguished alumni, and department tours. Early bird registrations receive exclusive alumni merchandise.',
    priority: 'urgent',
    status: 'Published'
  },
  {
    title: 'Global Alumni Mentorship Program 2026-2027 Cohort',
    content: 'Applications are now open for the 2026 Mentorship Program. Alumni with 3+ years of professional experience are invited to mentor final-year students in software engineering, data science, finance, and management. Matchings begin next month.',
    priority: 'normal',
    status: 'Published'
  },
  {
    title: 'New Innovation & Entrepreneurship Incubation Grant Announced',
    content: 'The Alumni Foundation has partnered with the College Incubation Center to offer $50,000 in seed grants for student and alumni tech startups. Submissions close on October 15th. Detailed guidelines are available in the Portal Resources section.',
    priority: 'urgent',
    status: 'Published'
  },
  {
    title: 'Distinguished Alumni Awards 2026 Nominations',
    content: 'Nominate outstanding alumni who have demonstrated exceptional leadership, professional excellence, or service to society. Categories include Young Achiever, Innovation in Tech, and Lifetime Achievement. Deadline for nominations is November 1st.',
    priority: 'normal',
    status: 'Published'
  },
  {
    title: 'Launch of Alumni Connect Mobile Portal & Directory Upgrades',
    content: 'We have updated our portal with advanced search filters, direct messaging capability, and verified alumni badges. Ensure your profile details, current organization, and LinkedIn links are updated to get discovered.',
    priority: 'normal',
    status: 'Published'
  },
  {
    title: 'Fall 2026 Campus Recruitment & Alumni Referral Drive',
    content: 'Alumni working at top global tech and corporate firms are invited to submit job openings and conduct referral interviews for graduating seniors. Over 40 companies have registered for the upcoming fall drive.',
    priority: 'urgent',
    status: 'Published'
  },
  {
    title: 'Special Guest Lecture Series: Artificial Intelligence & Future of Work',
    content: 'Join Dr. Rajesh Kumar (Batch of 2012, AI Research Lead at Tech Global) as he delivers a keynote address on Generative AI and career choices in 2026. Free registration for all current students and registered alumni.',
    priority: 'normal',
    status: 'Published'
  },
  {
    title: 'Campus Library & Research Digital Access for Alumni',
    content: 'The institution is pleased to extend lifetime digital access to IEEE, ACM Digital Library, and JSTOR research publications for all verified alumni network members. Login through your registered portal credentials.',
    priority: 'normal',
    status: 'Published'
  },
  {
    title: 'Alumni Association Board Election Results 2026',
    content: 'The votes have been tallied for the 2026-2028 Alumni Association Executive Committee. We congratulate the newly elected office bearers and thank all members who participated in the democratic process.',
    priority: 'low',
    status: 'Published'
  },
  {
    title: 'Annual Sports & Athletic Alumni Championship',
    content: 'Dust off your sports gear! The annual Alumni vs Student Cricket, Football, and Basketball tournament will take place on campus grounds. Team registrations close this Friday.',
    priority: 'normal',
    status: 'Published'
  },
  {
    title: 'Women in Tech & Leadership Networking Summit',
    content: 'A special half-day summit focusing on breaking barriers, executive leadership, and mentorship for women in STEM fields. Panelists feature leaders from Microsoft, Amazon, and leading startups.',
    priority: 'urgent',
    status: 'Published'
  },
  {
    title: 'Alumni Endowment Fund Reaches $2 Million Milestone',
    content: 'Thanks to generous contributions from our global alumni community, the Student Scholarship Endowment Fund has reached $2 million. This will fund full scholarships for 50 deserving undergraduate students this academic year.',
    priority: 'normal',
    status: 'Published'
  },
  {
    title: 'Career Pivot & Transition Workshop for Mid-Career Alumni',
    content: 'Looking to transition into Product Management, Data Engineering, or Executive Leadership? Join our interactive 2-day virtual workshop facilitated by senior industry experts.',
    priority: 'low',
    status: 'Published'
  },
  {
    title: 'Campus Infrastructure Expansion: New Science & Tech Block Inauguration',
    content: 'Alumni are invited to attend the virtual inauguration ceremony of the state-of-the-art Science & Technology Research Block, made possible by major donations from the Class of 2005.',
    priority: 'normal',
    status: 'Published'
  },
  {
    title: 'International Alumni Chapter Meets: San Francisco & London',
    content: 'Local chapter meetups are happening next weekend in Silicon Valley (Palo Alto) and London (Canary Wharf). Reconnect with fellow alumni living and working abroad!',
    priority: 'normal',
    status: 'Published'
  },
  {
    title: 'Urgent Appeal: Community Outreach & Student Emergency Fund Drive',
    content: 'The Alumni Community Impact Team is organizing a support drive and emergency grant taskforce to assist underprivileged students. Voluntary donations and remote mentoring opportunities are open.',
    priority: 'urgent',
    status: 'Published'
  },
  {
    title: 'Spring 2027 Research Internship Openings for Pre-Final Year Students',
    content: 'Alumni research labs at MIT, Stanford, and IISc are offering summer 2027 research internships exclusively for students of our institute. Check the Jobs & Internships section for details.',
    priority: 'normal',
    status: 'Published'
  },
  {
    title: 'Annual Alumni Chronicle & Memories Publication Call for Submissions',
    content: 'Share your high-res photos, campus memories, and updates for the 2026 Edition of the Alumni Chronicle. Submissions accepted until October 30.',
    priority: 'low',
    status: 'Published'
  },
  {
    title: 'Cyber Security & Data Privacy Awareness Masterclass',
    content: 'Learn modern data protection strategies, cloud compliance, and security best practices from CISOs among our alumni network in this free weekend masterclass.',
    priority: 'normal',
    status: 'Published'
  },
  {
    title: 'Year-End Grand Networking Gala & Cultural Evening',
    content: 'Mark your calendars for December 20, 2026. An enchanting evening of dinner, cultural performances, musical bands, and networking at Grand Heritage Ballroom.',
    priority: 'urgent',
    status: 'Published'
  }
];

const EVENTS = [
  {
    name: 'Annual Alumni Homecoming Meet 2026',
    event_date: '2026-09-25',
    event_date_end: '2026-09-27',
    event_time: '09:00 AM - 06:00 PM',
    venue: 'Main College Campus Auditorium',
    host: 'Alumni Association & Dean Office',
    status: 'upcoming',
    description: 'A flagship 3-day event reconnecting alumni across all graduating batches. Includes keynote speeches, campus tours, department showcases, gala dinner, and cultural performances.'
  },
  {
    name: 'Global Career & Startup Expo 2026',
    event_date: '2026-10-05',
    event_date_end: '2026-10-06',
    event_time: '10:00 AM - 05:00 PM',
    venue: 'College Multipurpose Convention Center',
    host: 'Placement Cell & Alumni Network',
    status: 'upcoming',
    description: 'Over 50 companies and alumni-led startups hire for full-time roles and internships. Interactive booth sessions, resume reviews, and spot interview rounds.'
  },
  {
    name: 'AI & Cloud Engineering Tech Summit',
    event_date: '2026-10-15',
    event_date_end: '2026-10-15',
    event_time: '11:00 AM - 04:00 PM',
    venue: 'Virtual (Zoom & YouTube Live)',
    host: 'Computer Science Alumni Chapter',
    status: 'upcoming',
    description: 'Deep dive into LLMs, MLOps, Kubernetes, and Serverless architectures. Features tech talks by senior architects from Google, AWS, and Microsoft.'
  },
  {
    name: 'Women Leadership in Tech Workshop',
    event_date: '2026-10-22',
    event_date_end: '2026-10-22',
    event_time: '02:00 PM - 06:00 PM',
    venue: 'Seminar Hall B, Admin Building',
    host: 'Women in Tech Forum',
    status: 'upcoming',
    description: 'Empowering future leaders through talks on salary negotiation, executive presence, overcoming burnout, and navigating career growth in corporate environments.'
  },
  {
    name: 'Alumni Founders Pitch & Venture Night',
    event_date: '2026-11-02',
    event_date_end: '2026-11-02',
    event_time: '05:00 PM - 09:00 PM',
    venue: 'Innovation Hub Auditorium',
    host: 'Alumni Angel Syndicate',
    status: 'upcoming',
    description: '10 selected student and alumni startups pitch their innovative products to top VC investors and angel networks for seed funding up to $100K.'
  },
  {
    name: 'Annual Inter-Batch Alumni Cricket & Football Cup',
    event_date: '2026-11-12',
    event_date_end: '2026-11-14',
    event_time: '08:00 AM - 05:00 PM',
    venue: 'Sports Ground & Stadium',
    host: 'Sports Council',
    status: 'upcoming',
    description: 'Exciting sports tournament featuring teams from different graduation decades (2000s, 2010s, 2020s) competing against current college varsity teams.'
  },
  {
    name: 'Cybersecurity & Ethical Hacking Masterclass',
    event_date: '2026-11-20',
    event_date_end: '2026-11-20',
    event_time: '10:00 AM - 02:00 PM',
    venue: 'Computer Lab 4 & Virtual Stream',
    host: 'Dept of Information Technology',
    status: 'upcoming',
    description: 'Hands-on workshop on network security, zero-trust architecture, red teaming, and bug bounty strategies led by industry cybersecurity veterans.'
  },
  {
    name: 'Higher Studies & Foreign University Guidance Webinar',
    event_date: '2026-12-01',
    event_date_end: '2026-12-01',
    event_time: '06:00 PM - 08:30 PM',
    venue: 'Virtual (Google Meet)',
    host: 'International Student Cell',
    status: 'upcoming',
    description: 'Alumni currently studying at MIT, Oxford, CMU, and ETH Zurich share tips on GRE/TOEFL preparation, SOP writing, scholarship applications, and visa processes.'
  },
  {
    name: 'Civil & Electrical Engineering Innovations Conference',
    event_date: '2026-12-10',
    event_date_end: '2026-12-11',
    event_time: '09:30 AM - 04:30 PM',
    venue: 'Mechanical Engineering Conference Room',
    host: 'Engineering Alumni Chapter',
    status: 'upcoming',
    description: 'Exploring sustainable infrastructure, smart grids, renewable energy systems, and green building technologies with industry pioneers.'
  },
  {
    name: 'Grand Winter Charity Ball & Cultural Night',
    event_date: '2026-12-20',
    event_date_end: '2026-12-20',
    event_time: '06:30 PM - 11:00 PM',
    venue: 'Grand Imperial Hotel Ballroom',
    host: 'Alumni Philanthropy Committee',
    status: 'upcoming',
    description: 'An elegant evening featuring live orchestra, fine dining, silent auction, and awards presentation honoring key donors and community contributors.'
  },
  {
    name: 'Finance & Quantitative Trading Bootcamp',
    event_date: '2027-01-10',
    event_date_end: '2027-01-11',
    event_time: '10:00 AM - 03:30 PM',
    venue: 'Financial Analytics Lab',
    host: 'Economics & Finance Club',
    status: 'upcoming',
    description: 'Master algorithmic trading, risk management, fintech models, and portfolio optimization techniques taught by Wall Street and Dalal Street alumni.'
  },
  {
    name: 'Product Management & UX Design Hackathon',
    event_date: '2027-01-22',
    event_date_end: '2027-01-24',
    event_time: '09:00 AM - 09:00 PM',
    venue: 'Student Activity Center',
    host: 'Design & Product Club',
    status: 'upcoming',
    description: '48-hour challenge to design solutions for real-world business problems. Cash prizes of $5,000 for winning product teardown and prototype designs.'
  },
  {
    name: 'Healthcare & BioTech Frontier Symposium',
    event_date: '2027-02-05',
    event_date_end: '2027-02-05',
    event_time: '10:00 AM - 04:00 PM',
    venue: 'Medical Sciences Block Auditorium',
    host: 'Healthcare Alumni Special Interest Group',
    status: 'upcoming',
    description: 'Discover breakthrough research in personalized medicine, bioinformatics, medical AI diagnostics, and biomedical device manufacturing.'
  },
  {
    name: 'Alumni Mentorship Speed Networking Night',
    event_date: '2027-02-18',
    event_date_end: '2027-02-18',
    event_time: '05:30 PM - 08:30 PM',
    venue: 'Central Campus Lawn & Gazebo',
    host: 'Alumni Mentorship Council',
    status: 'upcoming',
    description: 'Fast-paced 1-on-1 interaction sessions allowing final year students to rotate through 8 senior alumni mentors for quick feedback and career advice.'
  },
  {
    name: 'Renewable Energy & CleanTech Summit 2027',
    event_date: '2027-03-02',
    event_date_end: '2027-03-03',
    event_time: '09:00 AM - 05:00 PM',
    venue: 'Green Energy Research Pavilion',
    host: 'Sustainable Tech Alumni Taskforce',
    status: 'upcoming',
    description: 'Focused on EV technology, battery storage, solar innovation, and carbon capture solutions transforming global energy systems.'
  },
  {
    name: 'Data Science & Big Data Architecture Masterclass',
    event_date: '2027-03-15',
    event_date_end: '2027-03-15',
    event_time: '10:00 AM - 03:00 PM',
    venue: 'Virtual (MS Teams)',
    host: 'Data Engineering Alumni Group',
    status: 'upcoming',
    description: 'Technical deep-dive into Snowflake, Databricks, Spark pipelines, and data governance for enterprise-scale systems.'
  },
  {
    name: 'Creative Arts, Film & Media Alumni Showcase',
    event_date: '2027-03-28',
    event_date_end: '2027-03-28',
    event_time: '04:00 PM - 09:00 PM',
    venue: 'Campus Open Air Theatre (OAT)',
    host: 'Media & Fine Arts Society',
    status: 'upcoming',
    description: 'Screening of short films, documentary premieres, art exhibitions, and panel talks with alumni working in film production and digital media.'
  },
  {
    name: 'Mid-Career Leadership & Executive Development Seminar',
    event_date: '2027-04-10',
    event_date_end: '2027-04-10',
    event_time: '09:30 AM - 01:30 PM',
    venue: 'Executive Education Center',
    host: 'Business School Alumni Forum',
    status: 'upcoming',
    description: 'Designed for alumni with 5-15 years experience transitioning to VP, Director, and C-Suite roles. Covers strategic decision making and org transformation.'
  },
  {
    name: 'Global Alumni Virtual Coffee Connect (Spring Edition)',
    event_date: '2027-04-22',
    event_date_end: '2027-04-22',
    event_time: '07:00 PM - 09:00 PM',
    venue: 'Gather.town Virtual Lounge',
    host: 'Global Alumni Engagement Team',
    status: 'upcoming',
    description: 'Informal virtual lounge meet for alumni across North America, Europe, Asia-Pacific, and Middle East to network in thematic virtual rooms.'
  },
  {
    name: 'Class of 2016 10-Year Milestone Reunion',
    event_date: '2027-05-08',
    event_date_end: '2027-05-09',
    event_time: '10:00 AM - 08:00 PM',
    venue: 'Main Campus Grounds & Alumni House',
    host: 'Class of 2016 Steering Committee',
    status: 'upcoming',
    description: 'A celebratory 10-year reunion for the batch of 2016 featuring nostalgic slide shows, faculty felicitations, campus tours, and celebratory banquet.'
  }
];

async function seedData() {
  console.log('🚀 Starting Seed script for Admin Announcements & Events...');
  let client;
  try {
    client = await pool.connect();

    // 1. Ensure admin user exists
    let adminId = null;
    const adminRes = await client.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminRes.rows.length > 0) {
      adminId = adminRes.rows[0].id;
    } else {
      const hash = await bcrypt.hash('AdminPass123!', 10);
      const newAdmin = await client.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, department, graduation_year, job_title, company, is_approved, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, 'active')
         RETURNING id`,
        ['System Administrator', 'admin@alumni.com', '+91 9876500000', hash, 'admin', 'Computer Science', 2018, 'Portal Administrator', 'AlumniConnect']
      );
      adminId = newAdmin.rows[0].id;
      console.log('✅ Created default admin user');
    }

    // 2. Ensure schema exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        priority VARCHAR(20) NOT NULL DEFAULT 'normal',
        status VARCHAR(20) NOT NULL DEFAULT 'Published',
        created_by INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        event_date DATE NOT NULL,
        event_date_end DATE,
        event_time VARCHAR(50),
        venue VARCHAR(150),
        description TEXT,
        host VARCHAR(150),
        capacity INT,
        image_url TEXT,
        status VARCHAR(20) DEFAULT 'upcoming',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 3. Seed 20 Announcements
    let addedAnnouncements = 0;
    for (const ann of ANNOUNCEMENTS) {
      const exists = await client.query('SELECT id FROM announcements WHERE title = $1', [ann.title]);
      if (exists.rows.length === 0) {
        await client.query(
          `INSERT INTO announcements (title, content, priority, status, created_by)
           VALUES ($1, $2, $3, $4, $5)`,
          [ann.title, ann.content, ann.priority, ann.status, adminId]
        );
        addedAnnouncements++;
      }
    }
    console.log(`📢 Announcements Seeded: ${addedAnnouncements} new added (Total checked: ${ANNOUNCEMENTS.length})`);

    // 4. Seed 20 Events
    let addedEvents = 0;
    for (const ev of EVENTS) {
      const exists = await client.query('SELECT id FROM events WHERE name = $1', [ev.name]);
      if (exists.rows.length === 0) {
        await client.query(
          `INSERT INTO events (name, event_date, event_date_end, event_time, venue, description, host, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [ev.name, ev.event_date, ev.event_date_end || null, ev.event_time, ev.venue, ev.description, ev.host, ev.status]
        );
        addedEvents++;
      }
    }
    console.log(`📅 Events Seeded: ${addedEvents} new added (Total checked: ${EVENTS.length})`);

    console.log('🎉 Seeding successfully completed!');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seedData();
}

module.exports = seedData;
