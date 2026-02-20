const express = require('express');
const cors = require('cors');
const app = express();

// Import the logic from the backend
// We use path.join to be absolutely sure about file resolution on Vercel
const authRoutes = require('../backend/routes/auth');
const profileRoutes = require('../backend/routes/profile');
const interviewRoutes = require('../backend/routes/interview');
const adminRoutes = require('../backend/routes/admin');
const errorHandler = require('../backend/middleware/errorHandler');

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: 'vercel', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/admin', adminRoutes);

// Error Handler
app.use(errorHandler);

// 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found on Vercel API` });
});

module.exports = app;
