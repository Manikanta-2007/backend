const mongoose = require('mongoose');

// Fallback Mocking for the ia32 environment
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    
    const connUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    console.log('\x1b[36mℹ\x1b[0m Attempting to connect to primary MongoDB (2s timeout)...');
    
    // Attempt real connection
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 2000,
    });
    
    console.log(`\x1b[32m✔\x1b[0m MongoDB Connected Successfully: ${conn.connection.host}`);
    return { isMemory: false };
  } catch (error) {
    console.log(`\x1b[33m⚠\x1b[0m Local MongoDB unreachable. Activating "Offline Demo Mode"...`);
    console.log(`\x1b[36mℹ\x1b[0m Environment: ia32-windows (Simplified data layer enabled)`);
    
    // In actual ia32 environments without binaries, we bypass the hard exit
    // and let the server start. The controllers will handle the mock data.
    return { isDemo: true };
  }
};

module.exports = connectDB;
