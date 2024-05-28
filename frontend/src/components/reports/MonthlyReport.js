import React, { useState, useEffect } from "react";
import "./ReportsPages.css";
import ibmLogo from "../../img/IBM-Logo.jpg";
import check from "../../img/check_icon.png";
import arrowBack from "../../img/arrow-back-ios.png";
import arrowForward from "../../img/arrow-forward-ios.png";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";


// reportsForm component
const MonthlyReport = ({ formData, selectedUser }) => {
  const [dbData, setDbData] = useState([]);
  const [monthTrigger, setMonthTrigger] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setLoading] = useState(true); 
  const [lit, setLit] = useState("<tr>");
  // State for error message
  const [errorMessage, setErrorMessage] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startOfWeek, setStartOfWeek] = useState();
  const [endOfWeek, setEndOfWeek] = useState();
  const [monthsBack, setMonthsBack] = useState(0);
  const [arrowRDisable, setArrowRDisable] = useState("arrow-end");
  const [arrowLDisable, setArrowLDisable] = useState("arrow-button");
  let date = new Date();
  let year = date.getFullYear();
  const [monthTemp, setMonthTemp] = useState(date.getMonth());
  const [yearTemp, setYearTemp] = useState(date.getFullYear());
  const navigate = useNavigate();
  // const prenexIcons = document.querySelectorAll(".calendar-navigation span");

  useEffect(() => {
    if(selectedUser)
      {
        manipulate(monthTemp)
        axios
        .post("/api/getEmployees", { email: formData.email })
        .then((response) => {
          if (response.data.numemployees > 0) {
            setEmployees(response.data.employees);
            // handleData(); // Fetch data immediately after getting employees
          } else {
            navigate("/checkin");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          navigate("/checkin");
        });}
        else
        {
          navigate("/reportsmenu")
        }
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
    
    setLoading(false);
  }, [monthTrigger, dbData, selectedUser]);

  

  useEffect(() => {
    let weekStartEnd = getWeek(currentDate)
    setStartOfWeek(weekStartEnd[0]);
    setEndOfWeek(weekStartEnd[1]);
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
    
    return [first_formatted_date, last_formatted_date]
  }
  
  const padWithZeros=(num, totalLength)=>{
    return String(num).padStart(totalLength, '0');
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
  if(monthsBack<1){
    setArrowRDisable("arrow-button")
    }else{
      setArrowLDisable("arrow-end")
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
  if(monthsBack>1){
    setArrowLDisable("arrow-button")
  }else{
    setArrowRDisable("arrow-end")
  }
  };
  
  if (isLoading) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
            }}
        >
            Loading the data{" "}
        </div>
    );
}

  
  // Render the reports form
  return (
    <div className="reports-form-container">
      <div className="reports-header">
        <h1 className="header-title">Punch Card</h1>
        <hr className="signin-hr"></hr>
        <img height="45px" alt="" src={ibmLogo} />
      </div>
      <div className="reports-form-box">
        
            <div className="table-header">
              <h1 className="reports-title">
                Monthly Report ({selectedUser})
              </h1>
              <div className="calendar-nav">
              <button
                onClick={() => {
                  prevMonth();
                }}
                className={arrowLDisable}
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
                className={arrowRDisable}
              >
                <img alt="" width="30px" src={arrowForward} />
              </button>
              </div>
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
            <div style={{ display: "flex", justifyContent: "end", gap: "15px" }}>
            <Link
                to="/reportsmenu"
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
      </div>
    </div>
  );
};

// Export the reportsForm component
export default MonthlyReport;
