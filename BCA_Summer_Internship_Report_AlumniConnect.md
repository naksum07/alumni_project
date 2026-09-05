# SUMMER INTERNSHIP PROJECT
# REPORT ON

### Project Title
## “ALUMNI CONNECT: WEB-BASED ALUMNI & STUDENT NETWORKING PORTAL”

<br>

# ICFAI
### UNIVERSITY
### SIKKIM

<br>

### By
**Ms. Roshika Rai (24STUCSKSG01029)**  
**Ms. Muskan Kumari (24STUCSKSG01022)**  
**Mr. Sahil Pradhan (24STUCSKSG01031)**  
**Mr. Bimal Chettri (24STUCSKGQ01008)**  

In the partial fulfillment of requirements for the award of degree in Bachelor of Computer Application (Batch 2024-2027)

<br>

### Under the Project Guidance of

| Internal Guide: | External Guide: |
| :--- | :--- |
| **Mrs. Diksha Giri** | **Mr. Dinesh Subba** |
| Assistant Professor | Assistant Director (IT) |

<br><br>

### SCHOOL OF INFORMATION TECHNOLOGY
### ICFAI UNIVERSITY SIKKIM
**RANKA ROAD, GANGTOK, EAST SIKKIM - 737101**

\pagebreak

---

# ICFAI
### UNIVERSITY
### SIKKIM

<br>

# CERTIFICATE

This is to certify that **Ms. Roshika Rai (24STUCSKSG01029)**, **Ms. Muskan Kumari (24STUCSKSG01022)**, **Mr. Sahil Pradhan (24STUCSKSG01031)**, and **Mr. Bimal Chettri (24STUCSKGQ01008)** has worked under the supervision of **Mrs. Diksha Giri** at ICFAI University Sikkim and have successfully completed the project titled **“ALUMNI CONNECT: WEB-BASED ALUMNI & STUDENT NETWORKING PORTAL”** in the fulfillment of the requirements for the Summer Internship Project from ICFAI University Sikkim under my supervision and guidance.

<br><br>

| **Mrs. Diksha Giri** | **Mr. Ajit Karki** | **Dr. Vivek Kumar Pathak** |
| :--- | :--- | :--- |
| Assistant Professor | HOD | Associate Dean |
| Faculty of Science and Technology | Faculty of Science and Technology | The ICFAI University Sikkim |
| The ICFAI University Sikkim | The ICFAI University Sikkim | |

<br><br>

**Examiner’s Signature**  
1.  
2.  
3.  
4.  

\pagebreak

---

# ACKNOWLEDGEMENT

We would like to thank **Mrs. Diksha Giri** (Assistant Professor, Faculty of Science & Technology) for her valuable guidance and constructive advice, helpful recommendations, and continuous support throughout the completion of this research project. The following work was greatly influenced by her encouragement and supervision. The authors would also like to thank **Mr. Ajit Karki** (HOD, Faculty of Science & Technology), **Mr. Dinesh Subba** (Assistant Director, IT), and faculty mentors for their valuable suggestions, academic assistance, and constant encouragement throughout the process of research.

We are also grateful to **Prof. O. R. S. Rao** (Hon'ble Chancellor), **Dr. Jagannath Patnaik** (Hon'ble Vice Chancellor), **Dr. Rohit Rathi** (Registrar) and **Mrs. Sandhya Rani Pant** (Joint Registrar) for their knowledge, guidance, support, and encouragement. We would like to thank The ICFAI University, Sikkim, for providing the academic environment, learning resources and institutional support in a successful completion of this study. The support and mentorship from the university facilitated the process of conducting research and execution well.

We would also like to thank all the faculty members and staff of the Department of Computer Applications for their cooperation and support during the project. Their motivation and help were very helpful in completing this work with success. Last but not least, we would like to thank everyone who has contributed to this project, in particular for their dedication, coordination, teamwork and active participation throughout its development, analysis and documentation. This research would not have been possible and meaningful without the combined effort of all the contributors.

\pagebreak

---

# DECLARATION

We, hereby declare that the project entitled **“ALUMNI CONNECT: WEB-BASED ALUMNI & STUDENT NETWORKING PORTAL”** is an original work carried out by us as part of the requirement for the degree of "Bachelor of Computer Applications". The work presented in this project has been completed under the guidance and supervision of Assistant Professor **Mrs. Diksha Giri**, Faculty of Science and Technology, The ICFAI University, Sikkim.

We further declare that this project has not been submitted previously, either in whole or in part, for the award of any degree, diploma, or other academic qualification from any university or institution. We take full responsibility for the originality, accuracy, and authenticity of the work presented in this project documentation.

<br><br>

| Place: The ICFAI University, Sikkim | **Roshika Rai** (24STUCSKSG01029) |
| :--- | :--- |
| Date: | **Muskan Kumari** (24STUCSKSG01022) |
| | **Sahil Pradhan** (24STUCSKSG01031) |
| | **Bimal Chettri** (24STUCSKGQ01008) |

\pagebreak

---

# TABLE OF CONTENTS

| Sl.no | Index | Page no. |
| :---: | :--- | :---: |
| | Abbreviation | i |
| | List of tables | ii |
| | List of Figures | iii |
| 1. | Introduction | 1-2 |
| 2. | System analysis and requirement specification | 3 |
| 3. | Project planning and methodology | 4-5 |
| 4. | Database design and data dictionary | 6 |
| 5. | Database and data dictionary table | 7-11 |
| 6. | System design and architecture | 12-13 |
| 7. | Hardware and software requirements | 14 |
| 8. | Technologies used | 15-16 |
| 9. | Feasibility study | 17 |
| 10. | Project planning | 18-19 |
| 11. | Snapshots | 20-22 |
| 12. | Coding | 23-32 |
| 13. | Testing | 33-35 |
| 14. | Future scope of the project | 36 |
| 15. | Limitations of the project | 37 |
| 16. | Conclusion | 38 |
| 17. | Bibliography | 39 |

\pagebreak

---

# LIST OF ABBREVIATIONS

| S. No. | Abbreviations | Meaning |
| :---: | :--- | :--- |
| 1 | API | Application Programming Interface |
| 2 | BCA | Bachelor of Computer Applications |
| 3 | CSS | Cascading Style Sheets |
| 4 | DB | Database |
| 5 | CORS | Cross Origin Resource Sharing |
| 6 | DOM | Document Object Model |
| 7 | FK | Foreign Key |
| 8 | HTML | Hypertext Markup Language |
| 9 | IDE | Integrated Development Environment |
| 10 | JSON | JavaScript Object Notation |
| 11 | JWT | JSON Web Token |
| 12 | PK | Primary Key |
| 13 | RBAC | Role-Based Access Control |
| 14 | RDBMS | Relational Database Management System |
| 15 | REST | Representational State Transfer |
| 16 | SDLC | Software Development Life Cycle |
| 17 | SQL | Structured Query Language |
| 18 | UI | User Interface |
| 19 | UX | User Experience |
| 20 | URL | Uniform Resource Locator |

\pagebreak

---

# LIST OF TABLES

| S. No. | Table Title | Page No. |
| :---: | :--- | :---: |
| 1 | Table 1: Project Profile | 1-2 |
| 2 | Table 2: Project Tools | 2 |
| 3. | Table 3: Users Database Table | 7 |
| 4. | Table 4: Password Resets Table | 8 |
| 5. | Table 5: Events Database Table | 8 |
| 6. | Table 6: Event Registrations Table | 9 |
| 7. | Table 7: Jobs Database Table | 10 |
| 8. | Table 8: Job Applications Table | 10 |
| 9. | Table 9: Feedback Table | 11 |
| 10. | Table 10: News Announcements Table | 11 |
| 11. | Table 11: Software Requirements | 14 |
| 12. | Table 12: Hardware Requirements | 14 |
| 13. | Table 13: Use Case Description | 18 |

\pagebreak

---

# LIST OF FIGURES

| S. No. | Figure Title | Page No. |
| :---: | :--- | :---: |
| 1 | Figure 1: Life Cycle Model | 18 |
| 2 | Figure 2: System architecture | 18 |
| 3 | Figure 3: Home Page | 20 |
| 4 | Figure 4: Alumni Directory Page | 20 |
| 5 | Figure 5: Student Directory Page | 21 |
| 6 | Figure 6: Career Opportunities & Jobs Page | 21 |
| 7 | Figure 7: Event Details & Registration Modal | 22 |
| 8 | Figure 8: User Profile & Privacy Controls | 22 |
| 9 | Figure 9: Admin Dashboard & Analytics | 23 |

\pagebreak

---

# 1. INTRODUCTION

Nowadays, technology is increasingly used by human beings in every field. The internet and smart devices have changed the way people discover information, connect with communities, and access institutional services. In higher educational institutions, communication between enrolled students and graduates is essential for professional mentorship, career opportunities, industry guidance, and community engagement.

AlumniConnect is a web-based alumni networking portal created for The ICFAI University, Sikkim. It provides a structured, friendly digital interface through which students, alumni, and administrators connect, share experiences, discover employment opportunities, and coordinate campus reunions. It presents alumni profiles, student directories, career openings, and event registrations using interactive cards and detail views, helping users build professional relationships.

The application utilizes a 3-tier client-server architecture with RESTful APIs. It implements Role-Based Access Control (RBAC) across three primary user roles: students, alumni, and administrators. Authentication is powered by JSON Web Tokens (JWT) and salted bcrypt password hashing, ensuring sensitive contact data—such as personal telephone numbers and email addresses—remains protected through selective privacy masking.

The project is designed as a modern web application rather than a native mobile application. It consists of an HTML5, Tailwind CSS, and Vanilla JavaScript frontend, an Express.js and Node.js backend, a PostgreSQL relational database repository, and modular REST API controllers.

### Table 1: Project Profile

| Attribute | Specification / Detail |
| :--- | :--- |
| **Project title** | “AlumniConnect: Web-Based Alumni & Student Networking Portal” |
| **Project type** | Web-based university alumni and student portal |
| **Organization** | The ICFAI University, Sikkim |
| **Developed by** | Roshika Rai, Muskan Kumari, Sahil Pradhan, Bimal Chettri |
| **Internal Guide** | Mrs. Diksha Giri |
| **External Guide** | Mr. Dinesh Subba |
| **Frontend** | HTML5, Tailwind CSS, Font Awesome 6.5, Vanilla JavaScript |
| **Backend** | Node.js (v18+), Express.js (v5.2.1) |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt.js password hashing |
| **Database** | PostgreSQL (v14+), node-postgres (pg) connection pool |
| **Response protocol** | HTTP and RESTful JSON APIs |

### Table 2: Project Tools
The project uses the following tools and technologies:

| Layer | Tools / Technologies |
| :--- | :--- |
| **Frontend** | HTML5, Tailwind CSS, Vanilla JavaScript (ES6+), Font Awesome 6.5 |
| **UI** | Responsive grid cards, modal dialogs, search bars, DOM APIs |
| **Backend** | Node.js, Express.js, CommonJS routing, dotenv |
| **Security & Auth** | jsonwebtoken (JWT), bcryptjs (10 rounds work factor) |
| **Data** | PostgreSQL relational database, pg connection pooling client |
| **Development** | npm, Git, Visual Studio Code, Postman |

\pagebreak

---

# 2. System Analysis and Requirement Specification

### 2.1 System Analysis
AlumniConnect is a web-based portal developed to provide students and alumni of The ICFAI University, Sikkim with reliable, structured, and easily accessible networking opportunities. The system is designed for the university community across its diverse departments, including Science & Technology, Management, Law, Hospitality, and Liberal Arts.

The system combines a conventional multi-page web application with RESTful JSON endpoints. Instead of relying on static spreadsheets or informal messaging groups, the system manages verified records in a central relational database. Unauthenticated visitors can view public directories, while authenticated students and alumni can access detailed profiles, discover jobs, register for reunions, and submit institutional feedback.

The application consists of two major parts: (1) Public and Member Interface and (2) Administrator Interface. The member interface allows users to search alumni, browse students, apply for jobs, and register for events. The administrator interface allows authorized staff to verify users, update account standing, manage event rosters, and publish university announcements.

### 2.2 Problem Identification
Students and alumni often need access to graduate directories, career guidance, job postings, reunion dates, campus news, and peer contact details. Traditional communication relies on fragmented department spreadsheets and informal chat groups. Users have difficulty finding reliable alumni information, contact details are frequently outdated, and job postings lack authenticity or centralized tracking. The proposed system solves this problem by providing a centralized web portal where records are stored securely, contact information is protected, and alumni directly publish verified opportunities.

### 2.3 Proposed Solution
The proposed system uses HTML5 and Tailwind CSS for the frontend, Node.js with Express.js for the backend, PostgreSQL for persistent relational storage, JSON Web Tokens for secure session validation, and bcryptjs for password hashing. The system retrieves verified institutional records and provides a responsive user experience across desktop and mobile devices.

\pagebreak

---

# 3. PROJECT PLANNING AND METHODOLOGY

### 3.1 Project Planning
AlumniConnect was developed as a modular full-stack web application. Development was divided into multiple stages so that each module could be engineered, tested, and verified independently. The major stages were requirement analysis, system and database design, frontend development, backend API development, database implementation, authentication setup, administrator module development, security auditing, and final integration.

### 3.2 Development Methodology
An iterative Waterfall methodology is suitable for this project because the application contains distinct client-server layers and well-defined relational tables that required structured modeling and continuous testing.  
The development process can be represented as:  
**Requirement Analysis → Design → Development → Testing → Feedback → Improvement → Integration.**

### 3.3 Development Phases
- **Phase 1 – Requirement Analysis:** Identify alumni, student, job board, event registration, and administrative requirements.
- **Phase 2 – System Design:** Design the 3-tier client-server architecture, database schema, and REST API routes.
- **Phase 3 – Database Development:** Implement PostgreSQL tables for users, password resets, events, event registrations, jobs, job applications, feedback, and news.
- **Phase 4 – Backend API Development:** Construct Express.js routers, controllers, JWT verification middleware, and bcrypt password hashing.
- **Phase 5 – Frontend Development:** Develop responsive HTML5 and Tailwind CSS views with vanilla JavaScript fetch clients and modal dialogs.
- **Phase 6 – Testing:** Test authentication, directory search, job posting, event registration, role guards, and cross-browser rendering.
- **Phase 7 – Deployment & Documentation:** Prepare source archives, database setup scripts, and formal project documentation.

### 3.4 Project Schedule
- Phase 1: Requirement gathering and analysis
- Phase 2: System architecture and database design
- Phase 3: Backend API development
- Phase 4: Frontend development
- Phase 5: Authentication and security integration
- Phase 6: Administrator console development
- Phase 7: Testing and debugging
- Phase 8: Final integration and documentation

### 3.5 Advantages of the Methodology
The structured methodology provides early detection of structural errors, cleaner debugging, modular development, secure role separation, easier integration of new features, better testing of individual API endpoints, and reduced implementation risk.

\pagebreak

---

# 4. DATABASE DESIGN AND DATA DICTIONARY

### 4.1 Database Design
The project uses PostgreSQL as the primary relational database for persistent application data. The database is named `alumni_portal` and uses the UTF-8 character set. The major relational tables are users, password_resets, events, event_registrations, jobs, job_applications, feedback, and news. Foreign keys link related records, with cascading deletion configured on dependent entities such as event registrations and job applications to maintain relational integrity.

### 4.2 Relational Model & Key Entities
The users table stores registered student, alumni, and administrator credentials. The jobs table tracks professional openings created by alumni. The events and event_registrations tables manage campus gatherings and attendee rosters. The feedback and news tables store user evaluations and university announcements.

\pagebreak

---

# 5. DATABASE AND DATA DICTIONARY TABLES

### Table 3: Users Database Table
| Field | Data Type | Key/Constraint | Description |
| :--- | :--- | :--- | :--- |
| id | SERIAL | Primary Key | Unique user identifier |
| full_name | VARCHAR(150) | NOT NULL | Full legal name |
| email | VARCHAR(150) | UNIQUE, NOT NULL | Login and contact email |
| phone | VARCHAR(20) | NULL | Contact telephone number |
| password_hash | TEXT | NOT NULL | Bcrypt hashed password |
| role | VARCHAR(20) | NOT NULL | Role: student, alumni, admin |
| department | VARCHAR(100) | NULL | Academic faculty / department |
| graduation_year | INT | NULL | Year of graduation |
| job_title | VARCHAR(150) | NULL | Current profession (alumni) |
| company | VARCHAR(150) | NULL | Current organization |
| is_approved | BOOLEAN | DEFAULT TRUE | Admin approval status |
| status | VARCHAR(20) | NOT NULL | Status: active, suspended, banned |
| show_phone_publicly | BOOLEAN | DEFAULT FALSE | Phone privacy visibility toggle |
| created_at | TIMESTAMP | NOT NULL | Account creation timestamp |

### Table 4: Password Resets Table
| Field | Data Type | Key/Constraint | Description |
| :--- | :--- | :--- | :--- |
| id | SERIAL | Primary Key | Unique reset record ID |
| user_id | INT | Foreign Key | References users(id) |
| token | TEXT | NOT NULL, Indexed | Cryptographic reset token |
| expires_at | TIMESTAMP | NOT NULL | Token expiration timestamp |
| created_at | TIMESTAMP | NOT NULL | Token generation time |

### Table 5: Events Database Table
| Field | Data Type | Key/Constraint | Description |
| :--- | :--- | :--- | :--- |
| id | SERIAL | Primary Key | Unique event identifier |
| name | VARCHAR(150) | NOT NULL | Event name or title |
| event_date | DATE | NOT NULL | Scheduled date |
| event_time | VARCHAR(50) | NULL | Scheduled time window |
| venue | VARCHAR(150) | NULL | Venue / Hall location |
| description | TEXT | NULL | Event agenda and scope |
| host | VARCHAR(150) | NULL | Hosting faculty or chapter |
| capacity | INT | NULL | Maximum attendee limit |
| image_url | TEXT | NULL | Cover image URL |
| status | VARCHAR(20) | DEFAULT 'upcoming' | Event status |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |

### Table 6: Event Registrations Table
| Field | Data Type | Key/Constraint | Description |
| :--- | :--- | :--- | :--- |
| id | SERIAL | Primary Key | Unique registration ID |
| event_id | INT | Foreign Key | References events(id) |
| user_id | INT | Foreign Key | References users(id) |
| full_name | VARCHAR(150) | NOT NULL | Registrant name |
| email | VARCHAR(150) | NOT NULL | Registrant email |
| phone | VARCHAR(20) | NULL | Registrant telephone number |
| message | TEXT | NULL | Optional session note |
| registered_at | TIMESTAMP | NOT NULL | Registration timestamp |

### Table 7: Jobs Database Table
| Field | Data Type | Key/Constraint | Description |
| :--- | :--- | :--- | :--- |
| id | SERIAL | Primary Key | Unique job ID |
| posted_by | INT | Foreign Key | References users(id) |
| title | VARCHAR(150) | NOT NULL | Job title |
| company | VARCHAR(150) | NOT NULL | Hiring organization |
| location | VARCHAR(150) | NULL | Job location / Remote |
| job_type | VARCHAR(50) | NULL | Type: Job or Internship |
| salary | VARCHAR(100) | NULL | Salary / Stipend info |
| skills | TEXT | NULL | Required technical skills |
| description | TEXT | NULL | Role description |
| status | VARCHAR(20) | NOT NULL | Status: open or closed |
| created_at | TIMESTAMP | NOT NULL | Posting timestamp |

### Table 8: Job Applications Table
| Field | Data Type | Key/Constraint | Description |
| :--- | :--- | :--- | :--- |
| id | SERIAL | Primary Key | Unique application ID |
| job_id | INT | Foreign Key | References jobs(id) |
| applicant_id | INT | Foreign Key | References users(id) |
| full_name | VARCHAR(150) | NOT NULL | Applicant name |
| email | VARCHAR(150) | NOT NULL | Applicant email |
| phone | VARCHAR(20) | NULL | Applicant telephone |
| cover_letter | TEXT | NULL | Applicant statement |
| resume_url | TEXT | NULL | Hosted resume link |
| applied_at | TIMESTAMP | NOT NULL | Application timestamp |

### Table 9: Feedback Table
| Field | Data Type | Key/Constraint | Description |
| :--- | :--- | :--- | :--- |
| id | SERIAL | Primary Key | Unique feedback ID |
| user_id | INT | Foreign Key | References users(id) |
| rating | INT | CHECK 1..5 | Star rating (1 to 5) |
| message | TEXT | NOT NULL | Feedback commentary |
| created_at | TIMESTAMP | NOT NULL | Submission timestamp |

### Table 10: News Announcements Table
| Field | Data Type | Key/Constraint | Description |
| :--- | :--- | :--- | :--- |
| id | SERIAL | Primary Key | Unique news ID |
| title | VARCHAR(255) | NOT NULL | Announcement headline |
| content | TEXT | NOT NULL | Announcement text body |
| category | VARCHAR(50) | NOT NULL | Category: News/Announcement |
| image_url | TEXT | NULL | Illustration image URL |
| publish_date | TIMESTAMP | NOT NULL | Release date |
| visibility | VARCHAR(50) | DEFAULT 'Everyone' | Audience |
| status | VARCHAR(20) | DEFAULT 'Published' | Status: Published/Draft |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

\pagebreak

---

# 6. SYSTEM DESIGN AND ARCHITECTURE

### 6.1 System Architecture
AlumniConnect follows a three-layer / client-server architecture consisting of Presentation Layer, Application/Business Layer, and Data Persistence Layer.

### 6.2 Presentation Layer
The presentation layer is developed using HTML5, Tailwind CSS, Font Awesome 6.5, and modern JavaScript (ES6+). It provides alumni directory browsing, student search, job postings, application submissions, event registrations, and administrative dashboard screens.

### 6.3 Application Layer
The application layer is implemented using Node.js and Express.js. The backend is responsible for API routing, user authentication, database operations, directory filtering, job posting controls, event attendee processing, request validation, and security access controls.

### 6.4 Data Persistence Layer
The data persistence layer utilizes PostgreSQL. All queries are strictly parameterized (`$1`, `$2`) to guarantee complete protection against SQL injection attacks. Database connection pooling is managed through the node-postgres (`pg`) library.

### 6.5 Session & Token Management
Authentication sessions are managed using stateless JSON Web Tokens. Upon successful authentication, a digitally signed token with a 2-hour lifetime is issued to the client and stored in browser localStorage. Subsequent requests attach this token via the HTTP Authorization header.

### 6.6 Role-Based Access Control (RBAC)
The application enforces three distinct security roles: student, alumni, and admin. While students can browse opportunities and apply, only verified alumni can post new jobs, and only administrators can access `/api/admin` endpoints.

### 6.7 API Communication
The frontend communicates with the backend using RESTful JSON APIs. Important endpoints include `/api/auth/login`, `/api/auth/register`, `/api/alumni`, `/api/students`, `/api/jobs`, `/api/events`, `/api/feedback`, and `/api/admin/dashboard`.

### 6.8 Security Architecture
Security mechanisms include administrator authentication guards, salted bcrypt password hashing (10 rounds), token-based authorization, request input validation, parameterized SQL queries, CORS protection, role whitelisting, and contact information masking.

\pagebreak

---

# 7. HARDWARE AND SOFTWARE REQUIREMENTS

### Table 11: Software Requirements
| Component | Minimum Requirement |
| :--- | :--- |
| **Operating System** | Windows 10/11, macOS, or Linux |
| **Runtime Environment** | Node.js (v18.0.0 or higher) |
| **Package Manager** | npm (v9.0.0 or higher) |
| **Backend Server** | Express.js framework (v5.2.1) |
| **Web Browser** | Modern browser: Google Chrome, Microsoft Edge, or Mozilla Firefox |
| **Database Engine** | PostgreSQL (v14.0 or higher) |
| **Code Editor** | Visual Studio Code (VS Code) |
| **API Testing Tool** | Postman / Thunder Client |

### Table 12: Hardware Requirements
| Component | Minimum requirement |
| :--- | :--- |
| **Processor** | Dual-core processor or better (2.0 GHz+) |
| **RAM** | 4 GB minimum; 8 GB recommended |
| **Storage** | At least 1 GB free storage for project files and database |
| **Network** | Internet connection required for CDN libraries |
| **Display** | 1366 × 768 or higher recommended |

\pagebreak

---

# 8. TECHNOLOGIES USED

### 8.1 Node.js
Node.js is an open-source, cross-platform JavaScript runtime built on Chrome's V8 engine that executes JavaScript code outside a browser. In this project, Node.js powers the asynchronous, event-driven backend server capable of handling multiple concurrent requests efficiently. Its non-blocking I/O model makes it optimal for high-throughput RESTful API data exchanges.

### 8.2 Express.js
Express.js is a minimal and flexible Node.js web application framework that provides a robust suite of HTTP routing and middleware features. In AlumniConnect, Express routes incoming client requests, manages static directory serving (/pages, /scripts, /assets), and parses incoming JSON payloads. The modular routing architecture cleanly separates authentication, directory queries, and administration logic.

### 8.3 PostgreSQL & pg Driver
PostgreSQL is a powerful, open-source object-relational database system known for reliability, feature robustness, and data integrity. The system utilizes the 'pg' library to maintain a connection pool, avoiding the latency of repeatedly establishing connections for each HTTP request. All SQL queries are strictly parameterized ($1, $2) to guarantee complete immunity against SQL injection vulnerabilities.

### 8.4 JSON Web Tokens (JWT)
JSON Web Token (JWT) is an open industry standard (RFC 7519) for securely transmitting information between parties as a digitally signed JSON object. AlumniConnect issues signed tokens containing user credentials (id, email, role) upon successful login with a 2-hour expiration window. This enables stateless, scalable authentication without maintaining server-side session stores.

### 8.5 Bcrypt.js
Bcrypt.js is an optimized JavaScript implementation of the bcrypt cryptographic hash function for password storage. It incorporates salt generation to protect against rainbow table attacks and adaptive work factors to defend against brute-force attacks. All user passwords are automatically hashed with 10 salt rounds prior to persistence.

### 8.6 HTML5 and Vanilla JavaScript
HTML5 provides the semantic structural foundation for the portal's pages, while Vanilla JavaScript (ES6+) handles asynchronous fetch operations, dynamic DOM rendering, and user session management. This native approach ensures fast loading times with minimal client overhead.

### 8.7 Tailwind CSS
Tailwind CSS is a utility-first CSS framework packed with classes that can be composed directly in HTML markup to construct custom responsive user interfaces. It is complemented by Font Awesome 6.5 for iconography and the AOS (Animate on Scroll) library for smooth scroll animations.

\pagebreak

---

# 9. FEASIBILITY STUDY

A feasibility study is an analysis and evaluation of a proposed project to determine whether it can be completed successfully within the available technical, operational and economic conditions. The AlumniConnect portal is feasible because it uses well-supported open-source web technologies and operates efficiently on standard campus infrastructure.

### 9.1 Technical Feasibility
The project uses Node.js, Express.js, PostgreSQL, Tailwind CSS, and Vanilla JavaScript, all of which are widely supported and suitable for a responsive web application. The modular backend separates routers, controllers, middleware, and database configuration, making the application technically maintainable.

### 9.2 Operational Feasibility
Visitors and students can access the portal through any modern web browser without installing specialized software. Directory cards, quick search, job applications, and event registration dialogs support a simple, intuitive user workflow.

### 9.3 Economic Feasibility
Development utilized standard university computing facilities and free, open-source software libraries under MIT and ISC licenses, resulting in zero licensing costs. Production deployment can run on affordable institutional cloud servers.

### 9.4 Schedule Feasibility
The project was divided into interface design, backend API development, database integration, security implementation, testing, and documentation. This structured plan allowed the team to develop and refine the system comfortably within the internship schedule.

\pagebreak

---

# 10. PROJECT PLANNING

### 10.1 Life Cycle Model
The life cycle model used for implementation is the Iterative Waterfall Model. Requirements are first understood and documented, and then the system is designed, implemented and tested. Feedback from each stage is used to refine the implementation.

```
[ Requirements Analysis ] --> [ System & DB Design ] --> [ Backend & Frontend Dev ]
                                                                     │
                                                                     v
[ Documentation ] <---------- [ Integration & Testing ] <---- [ Security & RBAC ]
```
*Figure 1: Life Cycle Model*

### 10.2 System Architecture
The system follows a 3-tier client-server architecture. The browser renders the HTML5 and Tailwind interface. The frontend calls Express.js endpoints for authentication, directory listings, and job applications. The backend executes parameterized queries against PostgreSQL and returns JSON responses.

```
[ BROWSER CLIENT (HTML5 + Tailwind CSS) ]
                     │  ▲
     HTTP Requests   │  │   JSON Responses
     (Bearer Token)  ▼  │
[ NODE.JS & EXPRESS.JS APPLICATION TIER ]
  - Auth Middleware (JWT Verification & requireAdmin)
  - Controllers: Auth, Alumni, Student, Jobs, Events, Admin
                     │  ▲
  Parameterized SQL  │  │   Query Results
  ($1, $2 Pooling)   ▼  │
[ POSTGRESQL RELATIONAL DATABASE (alumni_portal) ]
```
*Figure 2: System architecture*

### Table 13: Use Case Description

| Actor | Use case | Description |
| :--- | :--- | :--- |
| **Visitor** | Browse Directory | Browse alumni and student cards with locked contact emails. |
| **Visitor** | Self-Registration | Register for an account with role as student or alumni. |
| **Registered User** | Account Login | Authenticate credentials and obtain JWT session token. |
| **Student** | View Alumni Details | Unlock and view verified alumni email addresses and profiles. |
| **Student** | Apply for Job | Submit job application with cover letter and hosted resume URL. |
| **Alumni** | Post Opportunity | Publish job or internship vacancies exclusively available to students. |
| **Alumni** | Review Applicants | Inspect student applications submitted for own posted opportunities. |
| **Admin** | Manage Members | Approve, suspend, ban, or delete user accounts via admin console. |
| **Admin** | Host Events | Create university gatherings, reunions, and inspect attendee rosters. |

\pagebreak

---

# 11. SNAPSHOTS

*(Note: The following architectural mockups illustrate the visual layout of the production portal views).*

```
Figure 3: Home Page Layout
+--------------------------------------------------------------------------+
| [LOGO] AlumniConnect   Home  About  Directoryv  Events  News  Jobs       |
|                        [Admin Login]    [Login]    [Register]            |
+--------------------------------------------------------------------------+
| HERO: "Connect With Your Alumni Network"                                |
| A platform where students and alumni connect, share experiences, discover|
| opportunities, and build professional relationships.                     |
| [ Explore Directory ]             [ View Career Opportunities ]          |
+--------------------------------------------------------------------------+
| QUICK SEARCH: [ Name... ] [ Department v ] [ Batch v ] [ Search Button ] |
+--------------------------------------------------------------------------+
```
*Figure 3: Home Page*

```
Figure 4: Alumni Directory Layout
+--------------------------------------------------------------------------+
| TITLE: Alumni Directory (Showing 24 Alumni)                              |
| Search: [ Enter name, job title, company... ] [ Clear Search ]           |
+--------------------------------------------------------------------------+
| +--------------------+ +--------------------+ +------------------------+ |
| | (R) Rahul Sharma   | | (P) Priya Sharma   | | (A) Arjun Das          | |
| | Senior Dev @ Google| | Legal Analyst @ L&L| | Product Lead @ TCS     | |
| | CS Dept • 2021     | | Law Dept • 2020    | | Management • 2019      | |
| | [ View Profile ]   | | [ View Profile ]   | | [ View Profile ]       | |
| +--------------------+ +--------------------+ +------------------------+ |
+--------------------------------------------------------------------------+
```
*Figure 4: Alumni Directory Page*

```
Figure 6: Career Opportunities & Jobs Layout
+--------------------------------------------------------------------------+
| TITLE: Career Opportunities & Internships          [+ Post Opportunity]  |
| Filters: [ Search Keywords... ] [ Type: All/Job ] [ Location: All v ]    |
+--------------------------------------------------------------------------+
| +----------------------------------------------------------------------+ |
| | [G] Cloud Operations Intern                            [INTERNSHIP]  | |
| | Google Cloud • Bangalore (Hybrid) • Rs 35,000/month                  | |
| | Skills: Linux, Python, Docker, Cloud Basics                          | |
| | [ View Details / Apply Now Button ]                                  | |
| +----------------------------------------------------------------------+ |
+--------------------------------------------------------------------------+
```
*Figure 6: Career Opportunities & Jobs Page*

```
Figure 9: Administrative Dashboard Layout
+--------------------------------------------------------------------------+
| [LOGO] Admin Console    Dashboard   Events   News   Members    [Logout]  |
+--------------------------------------------------------------------------+
| METRICS: [ Total Users: 128 ] [ Alumni: 42 ] [ Students: 85 ] [ Events: 8]|
+--------------------------------------------------------------------------+
| RECENT EVENT ATTENDEES:              | RECENTLY REGISTERED MEMBERS:      |
| Event Name       Host    Attendees   | Name         Role    Date Joined  |
| Annual Reunion   Admin   145         | Arjun Das    Alumni  02-Aug-2026  |
| Tech Symposium   CS Dept 70          | Sneha Rai    Student 01-Aug-2026  |
+--------------------------------------------------------------------------+
```
*Figure 9: Admin Dashboard & Analytics*

\pagebreak

---

# 12. CODING

The following representative code extracts are taken from the AlumniConnect source archive and are included without changing the project logic.

### 12.1 Server Entrypoint & API Mounting (`backend/server.js`)
```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const studentRoutes = require('./routes/studentRoutes');
const jobRoutes = require('./routes/jobRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '..', 'frontend', 'pages')));
app.use('/scripts', express.static(path.join(__dirname, '..', 'frontend', 'scripts')));
app.use('/assets', express.static(path.join(__dirname, '..', 'frontend', 'assets')));
app.use('/admin', express.static(path.join(__dirname, '..', 'frontend', 'admin')));

// Mount API route handlers
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/feedback', feedbackRoutes);

const PORT = process.env.PORT || 5001;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
module.exports = app;
```

### 12.2 User Registration Controller (`backend/controllers/authController.js`)
```javascript
const SELF_REGISTERABLE_ROLES = ['student', 'alumni'];

async function register(req, res) {
  let { fullName, firstName, middleName, lastName, email, phone, password, role, department, graduationYear, expectedGraduationYear } = req.body;

  if (!fullName && (firstName || lastName)) {
    fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
  }
  const finalGradYear = graduationYear || expectedGraduationYear || req.body['expected-grad-year'] || null;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  const safeRole = SELF_REGISTERABLE_ROLES.includes(role) ? role : 'student';

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, department, graduation_year)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, full_name, email, role`,
      [fullName, email, phone, passwordHash, safeRole, department, finalGradYear]
    );

    res.status(201).json({ message: 'Registration successful', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
}
```

### 12.3 JWT Verification Middleware (`backend/middleware/auth.js`)
```javascript
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
  });
}

module.exports = { verifyToken, optionalAuth, requireAdmin };
```

### 12.4 Alumni Directory Search (`backend/controllers/alumniController.js`)
```javascript
async function searchAlumni(req, res) {
  const { department, year, search } = req.query;
  let query = `SELECT id, full_name, department, graduation_year, job_title, company
               FROM users WHERE role = 'alumni' AND is_approved = TRUE AND status = 'active'`;
  const params = [];

  if (department) {
    params.push(department);
    query += ` AND department = $${params.length}`;
  }
  if (year) {
    params.push(year);
    query += ` AND graduation_year = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    query += ` AND full_name ILIKE $${params.length}`;
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while searching alumni' });
  }
}
```

### 12.5 Job Posting Controller with RBAC (`backend/controllers/jobController.js`)
```javascript
async function postJob(req, res) {
  const { title, company, location, jobType, salary, skills, description } = req.body;

  if (!req.user || String(req.user.role || '').toLowerCase() !== 'alumni') {
    return res.status(403).json({ message: 'Only alumni can post opportunities.' });
  }
  if (!title || !company) {
    return res.status(400).json({ message: 'Job title and company are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO jobs (posted_by, title, company, location, job_type, salary, skills, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.id, title, company, location, jobType, salary, skills, description]
    );
    res.status(201).json({ message: 'Job posted successfully', job: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while posting job' });
  }
}
```

### 12.6 Dynamic Event Registration Handler (`frontend/scripts/events.js`)
```javascript
regForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const eventId   = regEventId.value;
  const firstName = document.getElementById('regFirstName').value.trim();
  const lastName  = document.getElementById('regLastName').value.trim();
  const fullName  = [firstName, lastName].filter(Boolean).join(' ');
  const email     = document.getElementById('regEmail').value.trim();
  const phone     = document.getElementById('regPhone')?.value.trim() || '';
  const message   = document.getElementById('regMsgText').value.trim();

  const submitBtn = regForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Registering…';

  try {
    const res = await fetch(`/api/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, phone, message }),
    });
    const data = await res.json();
    if (!res.ok) {
      showRegMessage(data.message || 'Registration failed.', true);
      return;
    }
    showRegMessage('Registered successfully!', false);
    regForm.reset();
    setTimeout(closeRegistrationModal, 2000);
  } catch (err) {
    showRegMessage('Could not reach server.', true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Register';
  }
});
```

### 12.7 Project Structure
The source archive separates the system into backend and frontend directories. The backend contains configuration, database scripts, controllers, routes, and middleware. The frontend contains pages, assets, and client scripts.

```text
alumni_project/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── alumniController.js
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── feedbackController.js
│   │   ├── jobController.js
│   │   ├── studentController.js
│   │   └── userController.js
│   ├── db/
│   │   └── schema.sql
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── alumniRoutes.js
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── studentRoutes.js
│   │   └── userRoutes.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── admin/
│   │   ├── dashboard.html
│   │   ├── events.html
│   │   ├── login.html
│   │   ├── members.html
│   │   └── news.html
│   ├── assets/
│   │   └── logo.png
│   ├── pages/
│   │   ├── about.html
│   │   ├── alumni-directory.html
│   │   ├── events.html
│   │   ├── feedback.html
│   │   ├── forgot-password.html
│   │   ├── index.html
│   │   ├── jobs.html
│   │   ├── login.html
│   │   ├── my-profile.html
│   │   ├── news-announcements.html
│   │   ├── register.html
│   │   ├── reset-password.html
│   │   └── student-directory.html
│   └── scripts/
│       ├── about.js
│       ├── admin-common.js
│       ├── alumni_directory.js
│       ├── events.js
│       ├── feedback.js
│       ├── index.js
│       ├── jobs.js
│       └── my-profile.js
├── package.json
└── README.md
```

\pagebreak

---

# 13. TESTING

### 13.1 Testing Objectives
Testing was performed to verify that the application functions according to requirements, backend APIs return expected results, authentication works correctly, database operations are reliable, invalid input is handled safely, security controls are working, and frontend pages render correctly.

### 13.2 Testing Methodology
The project uses manual acceptance and functional testing across core scenarios. Testing categories include Unit Testing, Integration Testing, API Testing, Security Testing, and Validation Testing.

### 13.3 Unit Testing
Unit testing verifies individual application components independently, including password validation regexes, role whitelisting functions, JWT token creation, and parameter parsing.

### 13.4 API Testing
API endpoints were tested for correct HTTP responses, input validation, authentication token verification, alumni directory search, student queries, job postings, and administrative metrics.

### 13.5 Authentication Testing
Authentication tests verify that valid student and alumni credentials are accepted, invalid credentials are rejected, protected endpoints cannot be accessed without authentication, and passwords are stored as secure bcrypt hashes.

### 13.6 Directory Testing
Directory-related testing verifies alumni and student retrieval, department filtering, graduation year filtering, search query handling, and contact masking for unauthenticated users.

### 13.7 Job Board Testing
Job testing verifies opportunity creation by alumni, restriction of job creation for student roles, application submission with resume links, and job closure by the posting alumni.

### 13.8 Event Registration Testing
Event testing verifies event creation by administrators, public calendar display, duplicate email registration rejection, and attendee roster generation.

### 13.9 Security Testing
Security testing covers invalid administrator login, missing authentication headers, SQL injection attempts (prevented via parameterized queries), role tampering during registration, and cross-site script validation.

### 13.10 Frontend Testing
The frontend was tested across Google Chrome, Microsoft Edge, and Mozilla Firefox. Tests verified responsive layouts across mobile and desktop viewport sizes, modal form open/close behaviors, and local storage token management.

### 13.11 Test Results
All 10 core manual functional test cases passed successfully. Database queries verified that relational records were correctly persisted in PostgreSQL. SQL injection tests passed because parameterized queries are used throughout. Authentication controls correctly enforced role separation.

### 13.12 Acceptance Testing
Acceptance testing confirmed that student registration, alumni verification, job applications, event enrollments, and administrative oversight operate in accordance with institutional requirements.

### 13.13 Conclusion of Testing
The testing process demonstrates that the major components of AlumniConnect have been verified. The backend endpoints, relational constraints, authentication review, and responsive client interfaces provide confidence in the system's functional behavior.

\pagebreak

---

# 14. FUTURE SCOPE OF THE PROJECT

The following are the future scope of the project:
- Add real-time peer messaging between students and alumni using WebSockets (Socket.io).
- Integrate automated transactional email notifications for registration and password recovery using Nodemailer.
- Implement cloud-hosted resume PDF uploads using Amazon S3 or Google Cloud Storage.
- Incorporate an intelligent mentorship matching engine based on academic department and career interest.
- Add an institutional donation and crowdfunding module with a secure payment gateway.
- Deploy the application with production environment variables, restricted CORS origins, and observability logging.

\pagebreak

---

# 15. LIMITATIONS OF THE PROJECT

The following are the Limitations of the project:
- The client-side navigation bar requires manual script inclusion across all static pages to display user session status uniformly.
- The news announcements view currently displays static entries and requires dynamic integration with the admin news API.
- Authentication endpoints currently lack IP-based rate limiting against rapid automated brute-force attempts.
- The project does not currently send automated verification emails upon registration.
- Uploaded resumes must currently be hosted on external links rather than direct server PDF storage.

\pagebreak

---

# 16. CONCLUSION

The AlumniConnect portal brings together a modern web interface and a secure relational backend to make institutional alumni networking easier to access for The ICFAI University, Sikkim. Students can discover alumni across diverse departments, seek professional opportunities, and register for campus gatherings. The project demonstrates the practical application of HTML5, Tailwind CSS, JavaScript, Node.js, Express.js, and PostgreSQL in a unified solution. The modular architecture provides a solid foundation that can be extended into a full production service for the university. With the constant guidance and support of our guides, Mrs. Diksha Giri and Mr. Dinesh Subba, the team members Roshika Rai, Muskan Kumari, Sahil Pradhan, and Bimal Chettri have completed this project documentation based on the developed web application.

\pagebreak

---

# 17. BIBLIOGRAPHY

- Project source archive: AlumniConnect Portal (The ICFAI University, Sikkim)
- Node.js Documentation: https://nodejs.org/docs/
- Express.js Documentation: https://expressjs.com/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- node-postgres (pg) Documentation: https://node-postgres.com/
- JSON Web Token (JWT) RFC 7519: https://datatracker.ietf.org/doc/html/rfc7519
- Bcrypt.js Documentation: https://www.npmjs.com/package/bcryptjs
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- MDN Web Docs: https://developer.mozilla.org/
- The ICFAI University, Sikkim: https://www.iusikkim.edu.in/

\pagebreak

---

<br><br>

### Submitted By:

**Ms. Roshika Rai**  
**Mr. Sahil Pradhan**  
**Ms. Muskan Kumari**  
**Mr. Bimal Chettri**  
**Name and Signature of IT Student**

<br><br><br>

### Forwarded By:

| **Signature of Supervisor** | **Signature of Co - Supervisor** |
| :--- | :--- |
| **Name & Designation** | **Name & Designation** |
| Mrs. Diksha Giri (Assistant Professor) | Mr. Dinesh Subba (Assistant Director, IT) |

<br><br><br>

### HOD of the Institute/School of IT, The ICFAI University Sikkim, Gangtok Sikkim
