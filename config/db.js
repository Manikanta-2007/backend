const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    
    const connUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!connUri) {
      throw new Error("No MongoDB URI provided");
    }

    console.log('\x1b[36mℹ\x1b[0m Attempting to connect to primary MongoDB...');
    
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`\x1b[32m✔\x1b[0m MongoDB Connected Successfully: ${conn.connection.host}`);
    return { isMemory: false };
  } catch (error) {
    console.log(`\x1b[33m⚠\x1b[0m Primary MongoDB unreachable: ${error.message}`);
    console.log(`\x1b[36mℹ\x1b[0m Starting In-Memory MongoDB Server for fallback...`);
    
    try {
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(memoryUri);
      console.log(`\x1b[32m✔\x1b[0m In-Memory MongoDB Connected: ${conn.connection.host}`);
      
      // Return isMemory: true so server.js seeds the database
      return { isMemory: true };
    } catch (memError) {
      console.error(`\x1b[31m✘\x1b[0m Failed to start in-memory database: ${memError.message}`);
      // Force exit since Mongoose is disconnected and requests will timeout
      process.exit(1);
    }
  }
};

module.exports = connectDB;
