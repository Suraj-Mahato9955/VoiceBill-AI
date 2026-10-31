require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const billRoutes = require("./routes/billRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/bills", billRoutes);

app.get("/", (req, res) => {
res.json({
message: "Welcome to VoiceBill AI API",
status: "Backend is running",
});
});

const startServer = async () => {
try {
await connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`VoiceBill AI server running on port ${PORT}`);
});

} catch (error) {
console.error("Server startup failed:", error.message);
process.exit(1);
}
};

startServer();
