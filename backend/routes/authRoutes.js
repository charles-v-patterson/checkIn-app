const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const checkInController = require("../controllers/checkinController")

// Register Route
router.post("/api/register", authController.register);

// Password Reset Route
router.post("/api/passwordReset", authController.passwordReset);

// Login Route
router.post("/api/login", authController.login);

// Test route (protected)
router.get("/check-token", authMiddleware, authController.checkToken);
router.get("/status", authMiddleware, checkInController.getCheckInStatus);

module.exports = router;
