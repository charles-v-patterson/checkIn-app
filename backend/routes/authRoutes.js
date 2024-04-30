const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Registration Route
router.post("/register", authController.register);

// Login Route
router.post("/login", authController.login);

// Test route (protected)
router.get("/check-token", authMiddleware, authController.checkToken);
router.get("/status", authMiddleware, checkinController.getCheckInStatus);
module.exports = router;
