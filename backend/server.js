require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// ── Import Routes ────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/auth');
const profileRoutes   = require('./routes/profile');
const interviewRoutes = require('./routes/interview');
const adminRoutes     = require('./routes/admin');

// ── Connect Database ──────────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Console request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Global rate limiter (auth routes have their own stricter limiter)
app.use('/api', apiLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/api/profile", (req, res) => {
  res.json({ message: "Profile API working" });
});
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/admin', adminRoutes);



// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Central Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// On Vercel, we export the app without calling .listen()
// This allows local development to still work while Vercel handles the routing
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ Initium.AI server running → http://localhost:${PORT}`);
  });
}

module.exports = app;

