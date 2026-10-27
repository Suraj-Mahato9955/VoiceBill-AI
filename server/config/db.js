const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MONGODB_URI is missing. Check server/.env and that dotenv loads before this file runs.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Atlas...");

    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB connected successfully!");
    console.log("Host:", connection.connection.host);
    console.log("Database:", connection.connection.name);
  } catch (error) {
    console.error("MongoDB connection failed!");
    console.error("Error:", error.message);

    if (/bad auth|authentication failed/i.test(error.message)) {
      console.error("Hint: wrong username/password. Reset the Database User password in Atlas > Database Access.");
    } else if (/ENOTFOUND|ECONNREFUSED|querySrv/i.test(error.message)) {
      console.error("Hint: DNS/network problem. Try another network or a non-SRV connection string.");
    } else if (/whitelist|IP|ReplicaSetNoPrimary|Server selection timed out/i.test(error.message)) {
      console.error("Hint: add your IP in Atlas > Network Access (or 0.0.0.0/0 for development).");
    }

    process.exit(1);
  }
}

module.exports = connectDB;
