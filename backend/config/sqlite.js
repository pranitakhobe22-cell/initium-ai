const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// On Vercel, the filesystem is read-only except for /tmp
// We detect Vercel environment and use /tmp for our SQLite database
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const DATA_DIR = isVercel ? '/tmp' : path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR) && !isVercel) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const dbPath = path.join(DATA_DIR, 'initium.db');
const db = new Database(dbPath, { verbose: console.log });


// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'candidate',
    profile_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS interviews (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    profile_data TEXT NOT NULL,
    questions TEXT,
    answers TEXT,
    score INTEGER DEFAULT 0,
    strengths TEXT,
    improvements TEXT,
    summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

module.exports = db;
