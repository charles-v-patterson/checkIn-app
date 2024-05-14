const cron = require("node-cron");
const { sendEmail } = require("./controllers/authController");
const Holidays = require("date-holidays");
const User = require("./models/User");
const CheckIn = require("./models/CheckIn");
const hd = new Holidays("US"); // Set your country
const moment = require("moment");

async function getUser(email) {
  return await User.findOne({ email: new RegExp(email, "i") });
}

function isCompanyHoliday(holiday) {
  switch (holiday.name) {
    case "New Year's Day": return true;
    case "New Year's Day (substitute day)": return true;
    case "Martin Luther King Jr. Day": return true;
    case "Memorial Day": return true;
    case "Independence Day": return true;
    case "Labor Day": return true;
    case "Thanksgiving Day": return true;
    case "Day after Thanksgiving Day": return true;
    case "Christmas Day" : return true;
    default : return false;
  }
}

async function getCheckInStatus(user) {
  const latestCheckIn = await CheckIn.findOne({ user: user.email }).sort({
    date: -1,
  }); // Find the most recent check-in

  const currentDate = moment().format("MM-DD-YYYY");
  if (latestCheckIn && latestCheckIn.date === currentDate) {
    return "Checked In";
  } else {
    return "Not Checked In";
  }
}

async function checkUsersAndSendNotifications() {
  // Check if today is a holiday
  const isHoliday = hd.isHoliday(new Date());
  if (isHoliday && isCompanyHoliday(isHoliday)) {
    return;
  }

  // Get all users
  const users = await User.find();

  let usersNotCheckedIn = [];

  for (let user of users) {
    let status = await getCheckInStatus(user);
    if (status === "Not Checked In") {
      usersNotCheckedIn.push(user);
    }
  }


  // Send email notifications to users who have not checked in
  usersNotCheckedIn.forEach(async (user) => {
    await sendEmail({body: {
                      email : user.email,
                      message : `Reminder: You have not checked in today.</p> <a href=http://localhost:3000/ class="button">Check In</a><p>Check in to set your location for the day.`
                    }});
  });
}

function startNotificationScheduler() {
  cron.schedule("0 12 * * 1-5", checkUsersAndSendNotifications);
  //cron.schedule("* * * * *", checkUsersAndSendNotifications);
}

startNotificationScheduler();

module.exports = { getCheckInStatus };