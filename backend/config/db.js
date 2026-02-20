const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('💡 TIP: Make sure your local MongoDB service is running (mongod).');
    console.log('💡 If you use MongoDB Atlas, update MONGO_URI in backend/.env');
    // Don't exit if we want to show a clear error to the user via logs
    // process.exit(1); 
  }
};

module.exports = connectDB;
