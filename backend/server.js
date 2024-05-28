const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const CheckIn = require("./models/CheckIn");
const moment = require("moment");
const cron = require("node-cron");
const startScheduler = require("./jobScheduler");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const checkinRoutes = require("./routes/checkinRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Configure Environment Variables
dotenv.config();

// Express App Initialization
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse incoming JSON payloads

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// API Routes
app.post("/api/login", authRoutes);
app.post("/api/passwordReset", authRoutes);
app.post("/api/verifyJWT", authRoutes);
app.post("/api/sendEmail", authRoutes);
app.post("/api/register", authRoutes);
app.post("/api/checkin", checkinRoutes);
app.get("/api/check-network", checkinRoutes);
app.post("/api/reports", reportRoutes);
app.post("/api/getEmployees", authRoutes);
app.post("/api/check-token", authRoutes);
app.post("/api/toggleNotifications", authRoutes);

// Basic Route for Testing
app.get("/", (req, res) => {
  res.send("Employee Check-In Backend");
});

// Start Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});