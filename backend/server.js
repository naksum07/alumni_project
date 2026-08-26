const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes');
const jobRoutes = require('./routes/jobRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'frontend', 'pages')));
app.use('/styles', express.static(path.join(__dirname, '..', 'frontend', 'styles')));
app.use('/scripts', express.static(path.join(__dirname, '..', 'frontend', 'scripts')));
app.use('/public', express.static(path.join(__dirname, '..', 'frontend', 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/jobs', jobRoutes);

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'admin-dashboard.html'));
});

app.get('/api/test', (req, res) => {
  res.send('Backend is connected!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));