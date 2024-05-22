const User = require('../models/User');
const CheckIn = require('../models/CheckIn');

exports.generateReport = async (req, res) => {
  try {
    // Fetch all check-ins
    const checkIns = await CheckIn.aggregate(
      [
        {
          $match: { user: { $in: req.body.employees }, },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "email",
            as: "user",
          },
        },
        {
          $set: {
            name: "$user.name",
            email: "$user.email",
            manager: "$user.manager",
          },
        },
        {
          $unset: "user",
        },
        {
          $group: {
            _id: "$email",
            checkins: {
              $push: {
                date: "$date",
                location: "$location",
              },
            },
            name: { $first: "$name", },
            manager: { $first: "$manager", },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "manager",
            foreignField: "email",
            as: "manager",
          },
        },
        {
          $set: { manager: "$manager.name", },
        },
        {
          $project: {
            _id: { $arrayElemAt: ["$_id", 0], },
            name: { $arrayElemAt: ["$name", 0], },
            manager: { $arrayElemAt: ["$manager", 0], },
            checkins: {
              $map: {
                input: {
                  $sortArray: {
                    input: {
                      $map: {
                        input: "$checkins",
                        as: "checkin",
                        in: {
                          $mergeObjects: [
                            { location: "$$checkin.location", },
                            { date: { 
                                $dateFromString: {
                                  dateString: "$$checkin.date",
                                  format: "%m-%d-%Y",
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                    sortBy: 1,
                  },
                },
                as: "checkin",
                in: {
                  $mergeObjects: [
                    { location: "$$checkin.location", },
                    { date: {
                        $dateToString: {
                          date: "$$checkin.date",
                          format: "%m-%d-%Y",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $unset: "_id",
        },
        {
          $sort: { name: 1, },
        },
      ]);

    // Send the report
    res.status(201).json(checkins);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while generating the report.' });
  }
};