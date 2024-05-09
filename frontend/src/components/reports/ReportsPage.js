import React, { useState } from "react";
import "./ReportsPage.css";
import ibmLogo from "../../img/IBM-Logo.jpg";
import check from "../../img/check_icon.png";
import arrowBack from "../../img/arrow-back-ios.png";
import arrowForward from "../../img/arrow-forward-ios.png";
import { Link } from "react-router-dom";

const data = [
  { name: "Anom", inOffice: 2, remote: 3 },
  { name: "Megha", inOffice: 1, remote: 4 },
  { name: "Subham", inOffice: 3, remote: 2 },
  { name: "Subham", inOffice: 3, remote: 2 },
  { name: "Subham", inOffice: 3, remote: 2 },
  { name: "Subham", inOffice: 3, remote: 2 },
  { name: "Subham", inOffice: 3, remote: 2 },
  { name: "Subham", inOffice: 3, remote: 2 },
  { name: "Subham", inOffice: 3, remote: 2 },
  { name: "Subham", inOffice: 3, remote: 2 },
  { name: "Subham", inOffice: 3, remote: 2 },
  { name: "Subham", inOffice: 3, remote: 2 },
  { name: "Subham", inOffice: 3, remote: 2 },
  { name: "Subham", inOffice: 3, remote: 2 },
  { name: "Subham", inOffice: 3, remote: 2 },
  { name: "Subham", inOffice: 3, remote: 2 },
];

const data3 = [
  { name: "Anom", date: "May 9th 24", location: "inOffice" },

];

const data2 = [
  {
    Location: "In Office",
    monday: true,
    tuesday: true,
    wednesday: false,
    thursday: true,
    friday: false,
    total: 3,
  },
  {
    Location: "Remote",
    monday: false,
    tuesday: false,
    wednesday: true,
    thursday: false,
    friday: true,
    total: 2,
  },
];
// reportsForm component
const ReportsPage = () => {
  const [selectedUser, setSelectedUser] = useState("");
  const [view, setView] = useState("Sum");
  const [lit, setLit] = useState("<tr>");
  const [currentD, setcurrentD] = useState();
  let date = new Date();
  let monthT = date.getMonth();
  let year = date.getFullYear();
  const [month, setMonth] = useState(date.getMonth());
  // const prenexIcons = document.querySelectorAll(".calendar-navigation span");

  // Array of month names
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Function to generate the calendar
  const manipulate = () => {
    
    // Get the first day of the month
    let dayone = new Date(year, month, 1).getDay();

    // Get the last date of the month
    let lastdate = new Date(year, month + 1, 0).getDate();

    // Get the day of the last date of the month
    let dayend = new Date(year, month, lastdate).getDay();

    // Get the last date of the previous month
    let monthlastdate = new Date(year, month, 0).getDate();

    // Variable to store the generated calendar HTML
    let litTemp = "";
    let seperator = 0;
    // Loop to add the last dates of the previous month
    for (let i = dayone; i > 0; i--) {
      litTemp += `<td class="inactive">${monthlastdate - i + 1}</td>`;
      seperator++;
    }

    // Loop to add the dates of the current month
    for (let i = 1; i <= lastdate; i++) {
      // Check if the current date is today
      let isToday =
        i === date.getDate() &&
        monthT === new Date().getMonth() &&
        year === new Date().getFullYear()
          ? "active"
          : "";
      litTemp += `<td class="${isToday}">${i}</td>`;
      seperator++;
      if (seperator % 7 === 0) {
        litTemp += `</tr><tr>`;
      }
      console.log(date.getDate)
    }

    // Loop to add the first dates of the next month
    for (let i = dayend; i < 6; i++) {
      litTemp += `<td class="inactive">${i - dayend + 1}</td>`;
    }

    // Update the text of the current date element
    // with the formatted current month and year
    setcurrentD(`${months[month]} ${year}`);

    // update the HTML of the dates element
    // with the generated calendar
    litTemp += `</tr>`;
    setLit(litTemp);
  };

  const prevMonth = (e) => {
    setMonth(month - 1);
    // Check if the month is out of range
    if (month < 0 || month > 11) {
      // Set the date to the first day of the
      // month with the new year
      date = new Date(year, month, new Date().getDate());

      // Set the year to the new year
      year = date.getFullYear();

      // Set the month to the new month
      setMonth(date.getMonth());
    } else {
      // Set the date to the current date
      date = new Date();
    }

    // Call the manipulate function to
    // update the calendar display
    console.log(month);
    manipulate();
  };

  const nextMonth = (e) => {
    setMonth(month + 1);
    // Check if the month is out of range
    if (month < 0 || month > 11) {
      // Set the date to the first day of the
      // month with the new year
      date = new Date(year, month, new Date().getDate());

      // Set the year to the new year
      year = date.getFullYear();

      // Set the month to the new month
      setMonth(date.getMonth());
    } else {
      // Set the date to the current date
      date = new Date();
    }

    // Call the manipulate function to
    // update the calendar display
    console.log(month);
    manipulate();
  };

  
  // Render the reports form
  return (
    <div className="reports-form-container">
      <div className="reports-header">
        <h1 className="header-title">Punch Card</h1>
        <hr className="signin-hr"></hr>
        <img height="45px" alt="" src={ibmLogo} />
      </div>{" "}
      {/* Add styling */}
      <div className="reports-form-box">
        {view === "Sum" ? (
          <>
            <div className="table-header">
              <h1 className="reports-title">
                {view === "Sum"
                  ? "Summary Report"
                  : view === "Mon"
                  ? `Monthly Summary (${selectedUser})`
                  : `Detailed Report (${selectedUser})`}
              </h1>
              <button className="arrow-button">
                <img alt="" width="30px" src={arrowBack} />
              </button>
              <h2 className="reports-date">04/29/24 - 05/03/24</h2>
              <button className="arrow-button">
                <img alt="" width="30px" src={arrowForward} />
              </button>
            </div>
            <hr className="reports-hr"></hr>
            <div className="table-div" style={{ overflowY: "auto" }}>
              <table>
                <tr>
                  <th>Name</th>
                  <th>In Office</th>
                  <th>Remote</th>
                  <th>Monthly Report</th>
                  <th>Detailed Report</th>
                </tr>

                {data.map((val, key) => {
                  return (
                    <tr key={key}>
                      <td>{val.name}</td>
                      <td>{val.inOffice}</td>
                      <td>{val.remote}</td>
                      <td>
                        <button
                          className="view-button"
                          onClick={() => {
                            setView("Mon");
                            setSelectedUser(val.name);
                            manipulate();
                          }}
                        >
                          View
                        </button>
                      </td>
                      <td>
                        <button
                          className="view-button"
                          onClick={() => {
                            setView("Det");
                            setSelectedUser(val.name);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </table>
            </div>
          </>
        ) : view === "Mon" ? (
          <>
            <div className="table-header">
              <h1 className="reports-title">
                {view === "Sum"
                  ? "Summary Report"
                  : view === "Mon"
                  ? `Monthly Summary (${selectedUser})`
                  : `Detailed Report (${selectedUser})`}
              </h1>
              <button
                onClick={() => {
                  prevMonth();
                }}
                className="arrow-button"
              >
                <img alt="" width="30px" src={arrowBack} />
              </button>
              <h2
                className="reports-date"
                dangerouslySetInnerHTML={{ __html: currentD }}
              ></h2>
              <button
                onClick={() => {
                  nextMonth();
                }}
                className="arrow-button"
              >
                <img alt="" width="30px" src={arrowForward} />
              </button>
            </div>
            <hr className="reports-hr"></hr>
            <div className="table-div" style={{ overflowY: "auto" }}>
              <div className="calendar-container">
                <table className="calendar-body">
                  <thead>
                    <tr>
                      <th>Sunday</th>
                      <th>Monday</th>
                      <th>Tuesday</th>
                      <th>Wednesday</th>
                      <th>Thursday</th>
                      <th>Friday</th>
                      <th>Saturday</th>
                    </tr>
                  </thead>
                  <tbody
                    className="calendar-dates"
                    dangerouslySetInnerHTML={{ __html: lit }}
                  ></tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="table-header">
              <h1 className="reports-title">
                {view === "Sum"
                  ? "Summary Report"
                  : view === "Mon"
                  ? `Monthly Summary (${selectedUser})`
                  : `Detailed Report (${selectedUser})`}
              </h1>
              <button className="arrow-button">
                <img alt="" width="30px" src={arrowBack} />
              </button>
              <h2 className="reports-date">04/29/24 - 05/03/24</h2>
              <button className="arrow-button">
                <img alt="" width="30px" src={arrowForward} />
              </button>
            </div>
            <hr className="reports-hr"></hr>
            <div className="table-div" style={{ overflowY: "auto" }}>
              <table>
                <tr>
                  <th>Location</th>
                  <th>Monday</th>
                  <th>Tuesday</th>
                  <th>Wednesday</th>
                  <th>Thursday</th>
                  <th>Friday</th>
                  <th>Total</th>
                </tr>
                {data2.map((val, key) => {
                  return (
                    <tr key={key}>
                      <td>{val.Location}</td>
                      <td>
                        {val.monday ? (
                          <img alt="" width="30px" src={check} />
                        ) : (
                          <></>
                        )}
                      </td>
                      <td>
                        {val.tuesday ? (
                          <img alt="" width="30px" src={check} />
                        ) : (
                          <></>
                        )}
                      </td>
                      <td>
                        {val.wednesday ? (
                          <img alt="" width="30px" src={check} />
                        ) : (
                          <></>
                        )}
                      </td>
                      <td>
                        {val.thursday ? (
                          <img alt="" width="30px" src={check} />
                        ) : (
                          <></>
                        )}
                      </td>
                      <td>
                        {val.friday ? (
                          <img alt="" width="30px" src={check} />
                        ) : (
                          <></>
                        )}
                      </td>
                      <td>{val.total}</td>
                    </tr>
                  );
                })}
              </table>
            </div>
          </>
        )}
        <button className="back-button" onClick={() => setView("Sum")}>
          Back
        </button>
      </div>
    </div>
  );
};

// Export the reportsForm component
export default ReportsPage;
