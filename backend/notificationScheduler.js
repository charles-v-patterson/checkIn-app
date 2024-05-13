const cron = require("node-cron");
const { sendEmail } = require("./controllers/authController");
const Holidays = require("date-holidays");
const User = require("./models/User");
const CheckIn = require("./models/CheckIn");
const hd = new Holidays("US"); // Set your country

async function getUser(email) {
  return await User.findOne({ email: new RegExp(email, "i") });
}

async function getCheckInStatus(user) {
  const latestCheckIn = await CheckIn.findOne({ user: user.email }).sort({
    date: -1,
  }); // Find the most recent check-in

  if (latestCheckIn) {
    return "Checked In";
  } else {
    const hd = new Holidays("US"); // Set your country

    async function getCheckInStatus(user) {
      const latestCheckIn = await CheckIn.findOne({ user: user.email }).sort({
        date: -1,
      }); // Find the most recent check-in

      if (latestCheckIn) {
        return "Checked In";
      } else {
        return "Not Checked In";
      }
    }

    async function checkUsersAndSendNotifications() {
      // Check if today is a holiday
      const isHoliday = hd.isHoliday(new Date());
      if (isHoliday) {
        console.log("Today is a holiday, not sending notifications.");
        return;
      }

      // Get all users
      const users = await User.find();
    }

    // Get all users
    const users = await getUsers();

    // Filter users who have not checked in
    const usersNotCheckedIn = users.filter(
      (user) => getCheckInStatus(user) === "Not Checked In"
    );

    // Send email notifications to users who have not checked in
    usersNotCheckedIn.forEach(async (user) => {
      await sendEmail(
        user.email,
        "Reminder: You have not checked in today",
        "Please remember to check in today."
      );
    });
  }

  function startNotificationScheduler() {
    cron.schedule("0 9 * * *", checkUsersAndSendNotifications);
  }

  startNotificationScheduler();
}

module.exports = { getCheckInStatus };
