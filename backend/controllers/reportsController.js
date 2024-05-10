const User = require('../models/User');
const CheckIn = require('../models/CheckIn');

exports.generateReport = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find();

    // Fetch all check-ins
    const checkIns = await CheckIn.find();

    // Build the report
    const report = users.map(user => {
      // Find all check-ins for this user
      const userCheckIns = checkIns
      .filter(checkIn => checkIn.user === user.email)
      .map(checkIn => ({
        name: user.email,
        location: checkIn.location,
        date: checkIn.date,
      }));
      
      return {
        checkIns: userCheckIns,
      };
    });

    console.log(JSON.stringify(extractedReports, null, 2));
    // Send the report
    res.json(report);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while generating the report.' });
  }
};