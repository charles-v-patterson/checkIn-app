const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reportsController");

router.get('/api/reports', reportsController.generateReport);

module.exports = router;