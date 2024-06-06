const cron = require("node-cron");
const dotenv = require("dotenv").config();
const { sendEmail, getUserByUID } = require("./controllers/authController");
const Holidays = require("date-holidays");
const User = require("./models/User");
const CheckIn = require("./models/CheckIn");
const hd = new Holidays("US"); // Set your country
const moment = require("moment");

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
    if (!user.notification){
      continue;
    }
    let status = await getCheckInStatus(user);
    if (status === "Not Checked In") {
      usersNotCheckedIn.push(user);
    }
  }


  // Send email notifications to users who have not checked in
  usersNotCheckedIn.forEach(async (user) => {
    await sendEmail({body: {
                      email : user.email,
                      message : `Reminder: You have not checked in today.</p> <a href=${process.env.FRONTEND_URL} class="button">Check In</a><p>Check in to set your location for the day.`
                    }});
  });
}

async function updateEmps() {
  let cicLeaderRequest = await fetch(new Request("https://localhost:5000/api/getUserByUID", 
                                          {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" }, 
                                            body: JSON.stringify({uid: process.env.CIC_LEADER_UID}),
                                          }));
  const cicLeader = await cicLeaderRequest.json();
  const unVisited = [cicLeader];
  const emps = {};

  while (unVisited.length > 0) {
    const emp = unVisited.shift();
    emps[emp.uid] = {name: emp.name, email: emp.email, manager: emp.manager};
    const response = await fetch(new Request(`https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/(managerserialnumber=${emp.uid.substring(0,6)})/byjson?uid&callupname&mail&employeetype&ismanager`));
    const empdata = await response.json();

    for (let i = 0; i < empdata.search.entry.length; i++) {
      let curremp = empdata.search.entry[i];
      let uidIndx, nameIndx, mailIndx, mgrIndx, emptypeIndx;
      for (let i = 0; i < curremp.attribute.length; i++){
        switch (curremp.attribute[i].name) {
          case "mail": mailIndx = i; break;
          case "callupname": nameIndx = i; break;
          case "uid": uidIndx = i; break;
          case "ismanager": mgrIndx = i; break;
          case "employeetype": emptypeIndx = i; break;
        }
      }
      
      let name = curremp.attribute[nameIndx].value[0].split(",").reverse().join(" ").substring(1);
      let uid = curremp.attribute[uidIndx].value[0];
      let email = curremp.attribute[mailIndx].value[0];
      let mgr = curremp.attribute[mgrIndx].value[0];
      let emptype = curremp.attribute[emptypeIndx].value[0];

      if (emptype === "P" || emptype === "X") {
        if (mgr === "Y") {
          unVisited.push({name: name, uid: uid, email: email, manager: emp.uid});
        }
        else {
          emps[uid] = {name: name, email: email, manager: emp.uid};
        }
      }
    }
  }
  
  for(const key in emps) {
    const user = await User.findOne({email: emps[key].email});

    if (user) {
      let manageruid = emps[key].manager;
      if (emps[manageruid]) {
        emps[key].manager = emps[manageruid].email;
        if (emps[manageruid].email !== user.manager) {
          user.manager = emps[manageruid].email;
          user.save();
        }
      }
      else {
        delete emps[key].manager;
      }
    }
  }
}

// Function to delete old data
async function deleteOldData() {
  let days = [moment().subtract(6, "weeks").format("MM-DD-YYYY")];
  for (let i = 1; i < 7; i++) {
    days.push(moment().subtract(6, "weeks").subtract(i, "day").format("MM-DD-YYYY"));
  }

  try {
    await CheckIn.deleteMany({ date: { $in: days } });
    console.log("Old data deleted successfully");
  } catch (error) {
    console.error("Error deleting old data:", error);
  }
}

function startScheduler() {
  //run at 12:00pm every weekday
  //cron.schedule("0 12 * * 1-5", checkUsersAndSendNotifications);

  //run at 12:00am every day
  //cron.schedule("0 0 * * *", updateEmps);

  //run at 11:30pm every Saturday
  //cron.schedule("30 23 * * 6", deleteOldData);
}

startScheduler();

module.exports = { getCheckInStatus };