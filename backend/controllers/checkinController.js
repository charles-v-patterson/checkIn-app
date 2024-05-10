const CheckIn = require("../models/CheckIn");
const moment = require("moment"); // If you want to include timestamps

exports.checkin = async (req, res) => {
  try {
    const checkIn = new CheckIn({
      user: req.body.formData.email,
      date: moment().format("MM-DD-YYYY"), // Using moment.js for formatted timestamp
      location: req.body.formData.location ? "In Office" : "Remote",
    });
    
    const result = await checkIn.save();
    console.log(`Check in documents were inserted with the _id: ${checkIn._id}.`);
    res
      .status(201)
      .json({ message: "Check-in successful", checkIn: savedCheckIn });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Optional: Get a user's check-in history
exports.getCheckInHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    // Filter by date range (if provided)
    const filter = { user: req.user.id };
    if (startDate && endDate) {
      filter.date = {
        $gte: moment(startDate).startOf("day"), // Start of the day
        $lte: moment(endDate).endOf("day"), // End of the day
      };
    }

    const checkIns = await CheckIn.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1) // Convert limit (string) to a number
      .skip((page - 1) * limit);

    // Calculate total number of documents for pagination metadata
    const count = await CheckIn.countDocuments(filter);

    res.json({
      checkIns,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCheckInStatus = async (req, res) => {
  try {
    const latestCheckIn = await CheckIn.findOne({ user: req.user.id })
      .sort({ date: -1 }); // Find the most recent check-in

    if (latestCheckIn) {
      res.json({ status: 'Checked In', date: latestCheckIn.date }); // Send check-in status
    } else {
      res.json({ status: 'Not Checked In' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};