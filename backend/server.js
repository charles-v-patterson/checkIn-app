const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const CheckIn = require("./models/CheckIn");
const moment = require("moment");
const cron = require("node-cron");
const startNotificationScheduler = require("./notificationScheduler");
const authRoutes = require("./routes/authRoutes");
const checkinRoutes = require("./routes/checkinRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Import Routes

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
app.use("/api", authRoutes);
app.use("/api", checkinRoutes);
app.use("/api", reportRoutes);

// Basic Route for Testing
app.get("/", (req, res) => {
  res.send("Employee Check-In Backend");
});

// Start Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Function to delete old data
async function deleteOldData() {
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(
      moment().subtract(6, "weeks").subtract(i, "day").format("MM-DD-YYYY")
    );
  }

  try {
    await CheckIn.deleteMany({ date: { $in: days } });
    console.log("Old data deleted successfully");
  } catch (error) {
    console.error("Error deleting old data:", error);
  }
}

// Schedule the function to run at 11:30pm every Saturday
cron.schedule("30 23 * * 6", deleteOldData);
