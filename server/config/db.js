const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");

    const connection = await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 15000,
      }
    );

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection failed!");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    if (error.reason) {
      console.error("Error reason:", error.reason);
    }

    process.exit(1);
  }
};

module.exports = connectDB;
