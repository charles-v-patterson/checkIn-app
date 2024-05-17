const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const checkInController = require("../controllers/checkinController");

// Register Route
router.post("/api/register", authController.register);

// Password Reset Route
router.post("/api/passwordReset", authController.passwordReset);

router.post("/api/sendEmail", authController.sendEmail);

router.post("/api/verifyJWT", authController.verifyJWT);

// Login Route
router.post("/api/login", authController.login);

router.post("/api/getEmployees", authController.getEmployees);

router.post("/api/check-token", authMiddleware, authController.checkToken);

router.get("/api/status", authMiddleware, checkInController.getCheckInStatus);

module.exports = router;
