const User = require('../models/User');
const CheckIn = require('../models/CheckIn');

exports.generateReport = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find();

    // Fetch all check-ins
    const checkIns = await CheckIn.aggregate(
      [
        {
          $lookup:
            {
              from: "users",
              localField: "user",
              foreignField: "email",
              as: "user",
            },
        },
        {
          $set:
            {
              name: "$user.name",
              email: "$user.email",
            },
        },
        {
          $unset:
            "user",
        },
        {
          $match:
            {
              email: {
                $in: req.body.employees,
              },
            },
        },
        {
          $group:
            {
              _id: "$email",
              checkins: {
                $push: {
                  date: "$date",
                  location: "$location",
                },
              },
              name: {
                $first: "$name",
              },
            },
        },
      ]);

    
    const result = checkIns.map((checkin) => { return { name: checkin.name[0], checkins: checkin.checkins }});

    // Send the report
    res.status(201).json(checkIns);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while generating the report.' });
  }
};