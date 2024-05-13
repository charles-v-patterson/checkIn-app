const cron = require("node-cron");
const { sendEmail } = require("./controllers/authController");
const { getUsers, getCheckInStatus } = require("./userController"); // Assuming you have these functions
const Holidays = require("date-holidays");
const hd = new Holidays("US"); // Set your country

async function checkUsersAndSendNotifications() {
  // Check if today is a holiday
  const isHoliday = hd.isHoliday(new Date());
  if (isHoliday) {
    console.log("Today is a holiday, not sending notifications.");
    return;
  }

  // Get all users
  const users = await getUsers();

  // Filter users who have not checked in
  const usersNotCheckedIn = users.filter(
    (user) => getCheckInStatus(user) === "Not Checked In"
  );

  // Send email notifications to users who have not checked in
  if (usersNotCheckedIn.length > 0) {
    usersNotCheckedIn.forEach((user) => {
      sendEmail(
        user.email,
        "You have not checked in yet",
        "Please check in as soon as possible."
      );
    });
  }
}
