const express = require('express');
const router = express.Router();
const { startInterview, submitAnswer, endInterview } = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

// All routes prefixed with /api/interview in server.js
router.post('/start', protect, startInterview);
router.post('/answer', protect, submitAnswer);
router.post('/end', protect, endInterview);

module.exports = router;
