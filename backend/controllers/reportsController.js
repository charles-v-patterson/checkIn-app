const User = require('../models/User');
const CheckIn = require('../models/CheckIn');

exports.generateReport = async (req, res) => {
  try {
    const users = await User.find();

    const checkIns = await CheckIn.aggregate([
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
          name: { $arrayElemAt: ["$user.name", 0] },
          email: { $arrayElemAt: ["$user.email", 0] },
        },
      },
      {
        $unset: "user",
      },
      {
        $match: {
          email: {
            $in: req.body.employees,
          },
        },
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
          name: {
            $first: "$name",
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          checkins: {
            $map: {
              input: {
                $sort: {
                  path: "$checkins.date",
                  order: 1,
                },
              },
              as: "checkin",
              in: {
                $mergeObjects: [
                  {
                    location: "$$checkin.location",
                  },
                  {
                    date: {
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
    ]);

    const result = checkIns.map((checkin) => ({
      name: checkin.name,
      checkins: checkin.checkins,
    }));

    res.status(201).json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while generating the report.' });
  }
};
