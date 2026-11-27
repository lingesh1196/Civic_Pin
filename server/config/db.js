const mongoose = require('mongoose');

let isMongoConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[DB] MONGODB_URI not set — running with persistent local JSON store.');
    isMongoConnected = false;
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log(`[DB] Connected to MongoDB: ${uri}`);
    return true;
  } catch (err) {
    console.warn(`[DB] MongoDB unavailable (${err.message}) — falling back to persistent local JSON store.`);
    isMongoConnected = false;
    return false;
  }
}

function getIsMongoConnected() {
  return isMongoConnected;
}

module.exports = { connectDB, getIsMongoConnected };
