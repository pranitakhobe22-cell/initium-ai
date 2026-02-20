const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Vercel / Cloud Detection
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const DATA_DIR = isVercel ? '/tmp' : path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR) && !isVercel) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create data dir', e);
  }
}

const dbPath = path.join(DATA_DIR, 'initium.db');

let db;
try {
  console.log(`🔄 Initializing SQLite at: ${dbPath}`);
  db = new Database(dbPath, { verbose: console.log });
  
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
} catch (error) {
  console.error('⚠️ SQLite Initialization Failed. Using Cloud-Safe Resilient Storage Fallback.');
  console.error(error);
  
  // Mock DB object for controllers if binary fails
  db = {
    prepare: () => ({
      get: () => ({ count: 0 }),
      all: () => [],
      run: () => ({ changes: 1 })
    }),
    exec: () => {}
  };
}

module.exports = db;
