const mongoose = require("mongoose");

// Load environment variables
require("dotenv").config();

jest.setTimeout(30000);

beforeAll(async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/mentora";
    
    console.log("🔄 Connecting to MongoDB:", mongoUri);
    
    // Disconnect any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Connect to the same MongoDB as your server
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    
    console.log("✓ Connected to MongoDB for tests");
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error.message);
    process.exit(1);
  }
});

(async () => {
  try {
    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
  } catch (error) {
    console.error("✗ Disconnect error:", error.message);
  }
});