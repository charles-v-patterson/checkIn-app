import React, { useState, useEffect } from "react";
import "./ReportsPage.css";
import ibmLogo from "../../img/IBM-Logo.jpg";
import check from "../../img/check_icon.png";
import arrowBack from "../../img/arrow-back-ios.png";
import arrowForward from "../../img/arrow-forward-ios.png";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";


// reportsForm component
const ReportsPage = ({ formData }) => {
  const [dbData, setDbData] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [monthTrigger, setMonthTrigger] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [view, setView] = useState("Sum");
  const [lit, setLit] = useState("<tr>");
  // State for error message
  const [errorMessage, setErrorMessage] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startOfWeek, setStartOfWeek] = useState();
  const [endOfWeek, setEndOfWeek] = useState();
  const [weeksBack, setWeeksBack] = useState(0);
  const [monthsBack, setMonthsBack] = useState(0);
  let date = new Date();
  let year = date.getFullYear();
  const [monthTemp, setMonthTemp] = useState(date.getMonth());
  const [yearTemp, setYearTemp] = useState(date.getFullYear());
  const navigate = useNavigate();
  // const prenexIcons = document.querySelectorAll(".calendar-navigation span");

  useEffect(() => {
    axios
      .post("/api/getEmployees", { email: formData.email })
      .then((response) => {
        if (response.data.numemployees > 0) {
          setEmployees(response.data.employees);
          handleData(); // Fetch data immediately after getting employees
        } else {
          navigate("/checkin");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        navigate("/checkin");
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    handleData();
  }, [employees]);

  useEffect(() => {
    let person = dbData.filter((entry) => entry.name === selectedUser)[0];
    if (person) {
      person.checkins.forEach((checkin) => {
        let status_heading = document.getElementById(`${checkin.date + "-status"}`);
        if (status_heading) {
          status_heading.innerHTML = checkin.location;
        }
      });
    }
  }, [monthTrigger, selectedUser]);

  useEffect(() => {
    getWeek(currentDate);
  }, [currentDate]);

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
  // Function to handle form submission
  const handleData = async () => {
    try {
      const response = await axios.post("/api/reports", { employees });
      setDbData(response.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Data error.");
    }
  };

  const getWeek = (curr) => {
    var firstday = new Date(curr.setDate(curr.getDate() - curr.getDay()));
    let first_formatted_date = firstday.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    var lastday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6));
    let last_formatted_date = lastday.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    setStartOfWeek(first_formatted_date);
    setEndOfWeek(last_formatted_date);
  }
  
  const padWithZeros=(num, totalLength)=>{
    return String(num).padStart(totalLength, '0');
  }

  const weeklyCounter = (name, type)=>{
    let person = dbData.filter((entry) => entry.name === name)[0];
    let amount = person.checkins.filter((checkin) => checkin.location === type && 
                                        Date.parse(startOfWeek) <= Date.parse(checkin.date) &&
                                        Date.parse(checkin.date) <= Date.parse(endOfWeek));
    return amount.length;
  }

  const selectedWeeklyCounter = (type)=>{
    let person = dbData.filter((entry) => entry.name === selectedUser)[0];
    let amount = person.checkins.filter((checkin) => checkin.location === type && 
                                        Date.parse(startOfWeek) <= Date.parse(checkin.date) &&
                                        Date.parse(checkin.date) <= Date.parse(endOfWeek));
    return amount.length;
  }

  const weeklyStatus = (date)=> {
    let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",]
    let person = dbData.filter((entry) => entry.name === selectedUser)[0];
    let amount = person.checkins.filter((checkin) => Date.parse(startOfWeek) <= Date.parse(checkin.date) &&
                                                    Date.parse(checkin.date) <= Date.parse(endOfWeek));
    let status = {};
    amount.forEach((checkin) => {
      return status[daysOfWeek[new Date(checkin.date).getDay()]] = checkin.location;
    });

    return status[date];
  }
  // Function to generate the calendar
  const manipulate = (month) => {

    setMonthTrigger(!monthTrigger);

    // Get the first day of the month
    let dayone = new Date(yearTemp, month, 1).getDay();

    // Get the last date of the month
    let lastdate = new Date(yearTemp, month + 1, 0).getDate();

    // Get the day of the last date of the month
    let dayend = new Date(yearTemp, month, lastdate).getDay();

    // Get the last date of the previous month
    let monthlastdate = new Date(yearTemp, month, 0).getDate();

    // Variable to store the generated calendar HTML
    let litTemp = "";
    let seperator = 0;
    
    // Loop to add the last dates of the previous month
    for (let i = dayone; i > 0; i--) {
      let idDate = `${padWithZeros(month, 2)}-${padWithZeros(monthlastdate - i + 1, 2)}-${month === 0 ? yearTemp-1 : yearTemp}`;
      litTemp += `<td class="inactive">${monthlastdate - i + 1}<h2 id="${idDate + "-status"}"></h2></td>`;
      seperator++;
    }

    // Loop to add the dates of the current month
    for (let i = 1; i <= lastdate; i++) {
      // Check if the current date is today
      let idDate = `${padWithZeros(month+1, 2)}-${padWithZeros(i, 2)}-${yearTemp}`;
      // if (typeof user.checkins[i] != "undefined"){
      //   status = user.checkins[i].location}
      let isToday =
        i === date.getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear()
          ? "active"
          : "";
      litTemp += `<td class="${isToday}">${i}<h2 id="${idDate + "-status"}"></h2></td>`;
      seperator++;
      if (seperator % 7 === 0) {
        litTemp += `</tr><tr>`;
      }
    }

    // Loop to add the first dates of the next month
    for (let i = dayend; i < 6; i++) {
      let idDate = `${padWithZeros(month+1, 2)}-${padWithZeros(i, 2)}-${month === 11 ? yearTemp+1 : yearTemp}`;
      litTemp += `<td class="inactive">${i - dayend + 1}<h2 id="${idDate + "-status"}"></h2></td>`;
    }

    // with the generated calendar
    litTemp += `</tr>`;
    setLit(litTemp);
  };


  const prevMonth = () => {
    
    if(monthsBack<2){
    // Check if the month is out of range
    if (monthTemp > 0) {
      setMonthTemp(monthTemp-1);
      manipulate(monthTemp-1);
    } else {
      setMonthTemp(11);
      setYearTemp(yearTemp-1)
      manipulate(11);
    }
    setMonthsBack(monthsBack+1)
    
  }
  };

  const nextMonth = (e) => {
    if(monthsBack>0){
    // Check if the month is out of range
    if (monthTemp < 11) {
      setMonthTemp(monthTemp+1);
      manipulate(monthTemp+1);
    } else {
      setMonthTemp(0);
      setYearTemp(yearTemp+1)
      manipulate(0);
    }
    setMonthsBack(monthsBack-1)
    
  }
  };

  const prevWeek = () => {
    if(weeksBack<6){
    let lastWeekDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    setCurrentDate(lastWeekDate)
    setWeeksBack(weeksBack+1)
    }
  };
  const nextWeek = () => {
    if(weeksBack>0){
    let nextWeekDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    setCurrentDate(nextWeekDate)
    setWeeksBack(weeksBack-1)
    }
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
              <h1 className="reports-title">Summary Report</h1>
              <button
                className="arrow-button"
                onClick={() => {
                  prevWeek();
                }}
              >
                <img alt="" width="30px" src={arrowBack} />
              </button>
              <h2 className="reports-date">
                {startOfWeek} - {endOfWeek}
              </h2>
              <button
                className="arrow-button"
                onClick={() => {
                  nextWeek();
                }}
              >
                <img alt="" width="30px" src={arrowForward} />
              </button>
            </div>
            <hr className="reports-hr"></hr>
            <div className="table-div" style={{ overflowY: "auto" }}>
              <table>
                <tbody>
                  <tr>
                    <th>Name</th>
                    <th>In Office</th>
                    <th>Remote</th>
                    <th>Monthly Report</th>
                    <th>Weekly Report</th>
                  </tr>

                  {dbData.map((val, key) => {
                    return (
                      <tr key={key}>
                        <td>{val.name}</td>
                        <td>{weeklyCounter(val.name, "In Office")}</td>
                        <td>{weeklyCounter(val.name, "Remote")}</td>
                        <td>
                          <button
                            className="view-button"
                            onClick={() => {
                              setView("Mon");
                              setSelectedUser(val.name);
                              manipulate(monthTemp);
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
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "end" }}>
              <Link
                to="/checkin"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  justifyContent: "end",
                  width: "max-content",
                }}
              >
                <button className="back-button">Back</button>
              </Link>
            </div>
          </>
        ) : view === "Mon" ? (
          <>
            <div className="table-header">
              <h1 className="reports-title">
                Monthly Summary ({selectedUser})
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
                className="reports-date">
                {months[monthTemp]} {yearTemp}
              </h2>
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
            <button className="back-button" onClick={() => setView("Sum")}>
              Back
            </button>
          </>
        ) : (
          <>
            <div className="table-header">
              <h1 className="reports-title">Weekly Report ({selectedUser})</h1>
              <button
                className="arrow-button"
                onClick={() => {
                  prevWeek();
                }}
              >
                <img alt="" width="30px" src={arrowBack} />
              </button>
              <h2 className="reports-date">
                {startOfWeek} - {endOfWeek}
              </h2>
              <button
                className="arrow-button"
                onClick={() => {
                  nextWeek();
                }}
              >
                <img alt="" width="30px" src={arrowForward} />
              </button>
            </div>
            <hr className="reports-hr"></hr>
            <div className="table-div" style={{ overflowY: "auto" }}>
              <table>
                <tbody>
                  <tr>
                    <th>Location</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Total</th>
                  </tr>
                  {
                    <><tr key={0}>
                        <td>In Office</td>
                        <td>
                          {weeklyStatus("Monday") === "In Office" ? (
                            <img alt="" width="30px" src={check} />
                          ) : (
                            <></>
                          )}
                        </td>
                        <td>
                          {weeklyStatus("Tuesday") === "In Office" ? (
                            <img alt="" width="30px" src={check} />
                          ) : (
                            <></>
                          )}
                        </td>
                        <td>
                          {weeklyStatus("Wednesday") === "In Office" ? (
                            <img alt="" width="30px" src={check} />
                          ) : (
                            <></>
                          )}
                        </td>
                        <td>
                          {weeklyStatus("Thursday") === "In Office" ? (
                            <img alt="" width="30px" src={check} />
                          ) : (
                            <></>
                          )}
                        </td>
                        <td>
                          {weeklyStatus("Friday") === "In Office" ? (
                            <img alt="" width="30px" src={check} />
                          ) : (
                            <></>
                          )}
                        </td>
                        <td>{selectedWeeklyCounter("In Office")}</td>
                      </tr>
                      <tr key={1}>
                          <td>{"Remote"}</td>
                          <td>
                            {weeklyStatus("Monday") === "Remote" ? (
                              <img alt="" width="30px" src={check} />
                            ) : (
                              <></>
                            )}
                          </td>
                          <td>
                            {weeklyStatus("Tuesday") === "Remote" ? (
                              <img alt="" width="30px" src={check} />
                            ) : (
                              <></>
                            )}
                          </td>
                          <td>
                            {weeklyStatus("Wednesday") === "Remote" ? (
                              <img alt="" width="30px" src={check} />
                            ) : (
                              <></>
                            )}
                          </td>
                          <td>
                            {weeklyStatus("Thursday") === "Remote" ? (
                              <img alt="" width="30px" src={check} />
                            ) : (
                              <></>
                            )}
                          </td>
                          <td>
                            {weeklyStatus("Friday") === "Remote" ? (
                              <img alt="" width="30px" src={check} />
                            ) : (
                              <></>
                            )}
                          </td>
                          <td>{selectedWeeklyCounter("Remote")}</td>
                        </tr>
                  </>}
                </tbody>
              </table>
            </div>
            <button className="back-button" onClick={() => setView("Sum")}>
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Export the reportsForm component
export default ReportsPage;
