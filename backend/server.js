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
const successStoryRoutes = require('./routes/successStoryRoutes');
const communityRoutes = require('./routes/communityRoutes');

const fs = require('fs');

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

function getFrontendSubdir(subdir = '') {
  const candidates = [
    path.join(__dirname, '..', 'frontend', subdir),
    path.join(__dirname, 'frontend', subdir),
    path.join(process.cwd(), 'frontend', subdir),
    path.join(process.cwd(), '..', 'frontend', subdir),
    path.resolve('frontend', subdir),
    path.resolve('../frontend', subdir)
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return path.join(__dirname, '..', 'frontend', subdir);
}

const pagesDir = getFrontendSubdir('pages');
const stylesDir = getFrontendSubdir('styles');
const scriptsDir = getFrontendSubdir('scripts');
const publicDir = getFrontendSubdir('public');
const assetsDir = getFrontendSubdir('assets');
const adminDir = getFrontendSubdir('admin');
const communityBlogDir = getFrontendSubdir('community-blog');

// Static file mounts
app.use(express.static(pagesDir));
app.use('/pages', express.static(pagesDir));
app.use('/styles', express.static(stylesDir));
app.use('/scripts', express.static(scriptsDir));
app.use('/public', express.static(publicDir));
app.use('/assets', express.static(assetsDir));
app.use('/admin', express.static(adminDir));
app.use('/community-blog', express.static(communityBlogDir));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Explicit page route fallbacks (handles /pages/index.html, /index.html, /pages/, /)
app.get(['/', '/index.html', '/pages/index.html', '/pages', '/pages/'], (req, res) => {
  const indexPath = path.join(pagesDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).send('Page not found');
});

// Admin root redirect
app.get(['/admin', '/admin/'], (req, res) => {
  const adminLoginPath = path.join(__dirname, '..', 'frontend', 'admin', 'login.html');
  if (fs.existsSync(adminLoginPath)) {
    return res.sendFile(adminLoginPath);
  }
  res.redirect('/admin/login.html');
});

app.get('/pages/:page', (req, res) => {
  const pageFile = req.params.page.endsWith('.html') ? req.params.page : `${req.params.page}.html`;
  const filePath = path.join(pagesDir, pageFile);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  res.status(404).send('Page not found');
});

app.get('/:page', (req, res, next) => {
  const pageName = req.params.page;
  // Skip API, static asset directories, or existing routes
  if (['api', 'admin', 'scripts', 'styles', 'public', 'assets', 'uploads', 'community-blog', 'favicon.ico'].includes(pageName)) {
    return next();
  }
  const pageFile = pageName.endsWith('.html') ? pageName : `${pageName}.html`;
  const filePath = path.join(pagesDir, pageFile);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  next();
});

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
app.use('/api/success-stories', successStoryRoutes);
app.use('/api/community-posts', communityRoutes);
app.use('/api/community-blog', communityRoutes);
app.use('/api/community', communityRoutes);



app.get('/api/test', (req, res) => {
  res.send('Backend is connected!');
});

// Community Blog Route Aliases
app.get(['/community', '/community-blog'], (req, res) => {
  res.redirect('/community-blog/index.html');
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
