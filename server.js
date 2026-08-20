const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Serve HTML pages as the public site (this is now the "web root")
app.use(express.static(path.join(__dirname, 'frontend', 'pages')));

// Serve CSS and JS from their own folders, mounted at /styles and /scripts
app.use('/styles', express.static(path.join(__dirname, 'frontend', 'styles')));
app.use('/scripts', express.static(path.join(__dirname, 'frontend', 'scripts')));
app.use('/public', express.static(path.join(__dirname, 'frontend', 'public')));

app.get('/api/test', (req, res) => {
  res.send('Backend is connected!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


