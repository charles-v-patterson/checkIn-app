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
            /**
             * from: The target collection.
             * localField: The local join field.
             * foreignField: The target join field.
             * as: The name for the results.
             * pipeline: Optional pipeline to run on the foreign collection.
             * let: Optional variables to use in the pipeline field stages.
             */
            {
              from: "users",
              localField: "user",
              foreignField: "email",
              as: "user",
            },
        },
        {
          $set:
            /**
             * query: The query in MQL.
             */
            {
              name: "$user.name",
              email: "$user.email",
            },
        },
        {
          $unset:
            /**
             * Provide the field name to exclude.
             * To exclude multiple fields, pass the field names in an array.
             */
            "user",
        },
        {
          $match:
            /**
             * query: The query in MQL.
             */
            {
              email: {
                $in: [
                  "manager@ibm.com",
                  "Fred.Smith@ibm.com",
                ],
              },
            },
        },
        {
          $group:
            /**
             * _id: The id of the group.
             * fieldN: The first field name.
             */
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