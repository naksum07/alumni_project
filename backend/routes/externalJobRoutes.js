const express = require('express');
const router = express.Router();
const { searchExternalJobs } = require('../controllers/externalJobController');

// GET /api/external-jobs?what=developer&where=bangalore&country=in&page=1&per_page=20
router.get('/', searchExternalJobs);

module.exports = router;
