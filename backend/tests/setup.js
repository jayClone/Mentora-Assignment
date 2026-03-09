const mongoose = require("mongoose");

// Load environment variables
require("dotenv").config();

jest.setTimeout(30000);

beforeAll(async () => {
  try {
    // Use separate test database to avoid wiping production data
    const mongoUri = "mongodb://localhost:27017/mentora_test";
    
    console.log("🔄 Connecting to MongoDB Test Database:", mongoUri);
    
    // Disconnect any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Connect to test database
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    
    console.log("✓ Connected to MongoDB Test Database (mentora_test)");
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error.message);
    process.exit(1);
  }
});

afterAll(async () => {
  try {
    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB Test Database");
  } catch (error) {
    console.error("✗ Disconnect error:", error.message);
  }
});