const User = require("../models/User");
const CheckIn = require("../models/CheckIn");
const moment = require("moment");

exports.checkin = async (req, res) => {
  try {
    const currentDate = moment().format("MM-DD-YYYY");
    const { email, location } = req.body.formData;
    
    const user = await User.findOne({ email: new RegExp(email, "i") });
    const existingCheckin = await CheckIn.findOne({ user: new RegExp(email, "i"), date: currentDate });
    
    if (existingCheckin && existingCheckin.location === "In Office") {
      // Do nothing
    } else if (existingCheckin && existingCheckin.location === "Remote") {
      await CheckIn.updateOne({ _id: existingCheckin._id }, { location: location ? "In Office" : "Remote" });
    } else {
      const checkIn = new CheckIn({
        user: email === user.email ? email : user.email,
        date: currentDate,
        location: location ? "In Office" : "Remote",
      });
      await checkIn.save();
    }
    
    res.sendStatus(201);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCheckInHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const filter = { user: req.user.id };
    
    if (startDate && endDate) {
      filter.date = {
        $gte: moment(startDate).startOf("day"),
        $lte: moment(endDate).endOf("day"),
      };
    }
    
    const checkIns = await CheckIn.find(filter)
      .sort({ date: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const count = await CheckIn.countDocuments(filter);
    
    res.json({
      checkIns,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCheckInStatus = async (req, res) => {
  try {
    const latestCheckIn = await CheckIn.findOne({ user: req.user.id }).sort({ date: -1 });
    
    if (latestCheckIn) {
      res.json({ status: 'Checked In', date: latestCheckIn.date });
    } else {
      res.json({ status: 'Not Checked In' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
