const express = require('express');
const { scrapeWebsite } = require('../controllers/scrapeController');

const router = express.Router();

// POST /api/scrape - Scrape website content
router.post('/scrape', scrapeWebsite);

module.exports = router;
