import React, { useState, useEffect } from "react";
import "./ReportsPages.css";
import ibmLogo from "../../img/IBM-Logo.jpg";
import arrowBack from "../../img/arrow-back-ios.png";
import arrowForward from "../../img/arrow-forward-ios.png";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";


// reportsForm component
const WeekReport = ({ formData, updateSelectedUser }) => {
  const [dbData, setDbData] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [employees, setEmployees] = useState([]);
  const [isLoading, setLoading] = useState(true); 
  // State for error message
  const [errorMessage, setErrorMessage] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startOfWeek, setStartOfWeek] = useState();
  const [endOfWeek, setEndOfWeek] = useState();
  const [weeksBack, setWeeksBack] = useState(0);
  const [arrowRDisable, setArrowRDisable] = useState("arrow-end");
  const [arrowLDisable, setArrowLDisable] = useState("arrow-button");
  const navigate = useNavigate();
  // const prenexIcons = document.querySelectorAll(".calendar-navigation span");
  useEffect(() => {
    axios
      .post("/api/getEmployees", { email: formData.email })
      .then((response) => {
        if (response.data.numemployees > 0) {
          setEmployees(response.data.employees);
          //handleData(); // Fetch data immediately after getting employees
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
    setTimeout(() => {
      setLoading(false);
    }, 700);
  }, [employees]);

  useEffect(() => {
    let weekStartEnd = getWeek(currentDate)
    setStartOfWeek(weekStartEnd[0]);
    setEndOfWeek(weekStartEnd[1]);
  }, [currentDate]);

  // Array of month names
  
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
  

  const weeklyCounter = (week, name, type)=>{
    let person = dbData.filter((entry) => entry.name === name)[0];
    let amount = person.checkins.filter((checkin) => checkin.location === type && 
                                        Date.parse(week[0]) <= Date.parse(checkin.date) &&
                                        Date.parse(checkin.date) <= Date.parse(week[1]));
    return amount.length;
  }

  const prevWeek = () => {
    let modifier = 6;
    if(weeksBack<modifier){
    let lastWeekDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    setCurrentDate(lastWeekDate)
    setWeeksBack(weeksBack+1)
    }
    if(weeksBack<(modifier - 1)){
    setArrowRDisable("arrow-button")
    }else{
      setArrowLDisable("arrow-end")
    }
  };
  const nextWeek = () => {
    if(weeksBack>0){
    let nextWeekDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    setCurrentDate(nextWeekDate)
    setWeeksBack(weeksBack-1)
    }
    if(weeksBack>1){
      setArrowLDisable("arrow-button")
    }else{
      setArrowRDisable("arrow-end")
    }
  };

  if (isLoading) {
    return (
      <div className="reports-form-container">
      <div className="reports-header">
        <h1 className="header-title">Punch Card</h1>
        <hr className="signin-hr"></hr>
        <img height="45px" alt="" src={ibmLogo} />
      </div>{" "}
      {/* Add styling */}
      <div className="reports-form-box">
        
            <div className="table-header">
              <h1 className="reports-title">
                Week Summary 
              </h1>
            </div>
            <hr className="reports-hr"></hr>
            <div className="load-div" style={{ overflowY: "auto" }}>
            <div class="loader"></div>
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
}

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
            <div className="table-header">
              <h1 className="reports-title">Week Summary</h1>
              <div className="calendar-nav">
              <button
                className={arrowLDisable}
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
                className={arrowRDisable}
                onClick={() => {
                  nextWeek();
                }}
              >
                <img alt="" width="30px" src={arrowForward} />
              </button>
              </div>
            </div>
            <hr className="reports-hr"></hr>
            <div className="table-div" style={{ overflowY: "auto" }}>
              <table>
                <tbody>
                  <tr>
                    <th>Name</th>
                    <th>Manager</th>
                    <th>In Office</th>
                    <th>Remote</th>
                  </tr>

                  {dbData.map((val, key) => {
                    return (
                      <tr key={key}>
                        <td>{val.name}</td>
                        <td>{val.manager}</td>
                        <td>{weeklyCounter(getWeek(currentDate), val.name, "In Office")}</td>
                        <td>{weeklyCounter(getWeek(currentDate),val.name, "Remote")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
export default WeekReport;
