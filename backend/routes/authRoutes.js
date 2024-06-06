const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const checkInController = require("../controllers/checkinController");

// Register Route
router.post("/api/register", authController.register);

router.post("/api/remove", authController.remove);

router.post("/api/verifyJWT", authController.verifyJWT);

router.post("/api/getEmployees", authController.getEmployees);

router.post("/api/getUserByUID", authController.getUserByUID);

router.post("/api/toggleNotifications", authController.toggleNotifications);

router.post("/api/getNotificationsEnabled", authController.getNotificationsEnabled);

module.exports = router;
