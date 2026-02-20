const express = require('express');
const router = express.Router();
const { getAllInterviews } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Prefix /api/admin in server.js
router.get('/interviews', protect, authorize('admin'), getAllInterviews);

module.exports = router;
