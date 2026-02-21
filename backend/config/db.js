const db = require('./sqlite');

const connectDB = async () => {
  console.log('✅ SQLite Core Active: Platform is running with professional file-based persistence.');
  return db;
};

module.exports = connectDB;

