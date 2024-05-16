const cron = require("node-cron");
const { sendEmail } = require("./controllers/authController");
const Holidays = require("date-holidays");
const User = require("./models/User");
const CheckIn = require("./models/CheckIn");
const moment = require("moment");

const hd = new Holidays("US"); // Set your country

async function getUser(email) {
  return await User.findOne({ email: new RegExp(email, "i") });
}

function isCompanyHoliday(holiday) {
  const companyHolidays = [
    "New Year's Day",
    "New Year's Day (substitute day)",
    "Martin Luther King Jr. Day",
    "Memorial Day",
    "Independence Day",
    "Labor Day",
    "Thanksgiving Day",
    "Day after Thanksgiving Day",
    "Christmas Day"
  ];
  
  return companyHolidays.includes(holiday.name);
}

async function getCheckInStatus(user) {
  const latestCheckIn = await CheckIn.findOne({ user: user.email }).sort({
    date: -1,
  });

  const currentDate = moment().format("MM-DD-YYYY");
  return latestCheckIn && latestCheckIn.date === currentDate ? "Checked In" : "Not Checked In";
}

async function checkUsersAndSendNotifications() {
  const isHoliday = hd.isHoliday(new Date());
  if (isHoliday && isCompanyHoliday(isHoliday)) {
    return;
  }

  const users = await User.find();
  const usersNotCheckedIn = [];

  for (const user of users) {
    const status = await getCheckInStatus(user);
    if (status === "Not Checked In") {
      usersNotCheckedIn.push(user);
    }
  }

  usersNotCheckedIn.forEach(async (user) => {
    await sendEmail({
      body: {
        email: user.email,
        message: `Reminder: You have not checked in today.</p> <a href=http://localhost:3000/ class="button">Check In</a><p>Check in to set your location for the day.`
      }
    });
  });
}

function startNotificationScheduler() {
  cron.schedule("0 12 * * 1-5", checkUsersAndSendNotifications);
}

startNotificationScheduler();

module.exports = { getCheckInStatus };
