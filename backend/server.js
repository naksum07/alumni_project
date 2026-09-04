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
const newsRoutes = require('./routes/newsRoutes');
const externalJobRoutes = require('./routes/externalJobRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'frontend', 'pages')));
app.use('/styles', express.static(path.join(__dirname, '..', 'frontend', 'styles')));
app.use('/scripts', express.static(path.join(__dirname, '..', 'frontend', 'scripts')));
app.use('/public', express.static(path.join(__dirname, '..', 'frontend', 'public')));
app.use('/assets', express.static(path.join(__dirname, '..', 'frontend', 'assets')));
app.use('/admin', express.static(path.join(__dirname, '..', 'frontend', 'admin')));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/external-jobs', externalJobRoutes);
app.use('/api/announcements', announcementRoutes);

app.get('/api/test', (req, res) => {
  res.send('Backend is connected!');
});

// Global error handler — catches any unhandled errors passed via next(err)
// Must have 4 parameters for Express to recognize it as an error handler.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred'
  });
});

const PORT = process.env.PORT || 5001;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
