const mongoose = require('mongoose');

const connectDB = async () => {
  const atlasUri = process.env.MONGO_URI;
  const localUri = 'mongodb://127.0.0.1:27017/initium_ai';

  try {
    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    const conn = await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 8000 });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Atlas Connection Failed: ${error.message}`);
    
    if (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED') || error.message.includes('TIMEOUT')) {
      console.log('💡 Network Issue: Your connection might be blocking Atlas DNS.');
      console.log('🔄 Falling back to Local MongoDB...');
      
      try {
        const localConn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
        console.log(`✅ Local MongoDB Connected: ${localConn.connection.host}`);
      } catch (localError) {
        console.error(`❌ Local MongoDB also failed: ${localError.message}`);
        console.warn('⚠️ WARNING: Using the app without a persistent database. No data will be saved.');
      }
    }
  }
};

module.exports = connectDB;
