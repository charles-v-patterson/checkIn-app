const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reportsController");

router.post('/api/reports', reportsController.generateReport);

module.exports = router;