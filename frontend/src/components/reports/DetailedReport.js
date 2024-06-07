import React, { useState, useEffect } from "react";
import "./ReportsPages.css";
import ibmLogo from "../../img/IBM-Logo.jpg";
import check from "../../img/check_icon.png";
import arrowBack from "../../img/arrow-back-ios.png";
import arrowForward from "../../img/arrow-forward-ios.png";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useFormData } from '../context/FormDataContext';


// reportsForm component
const WeekReport = ({ updateSelectedUser, selectedUser }) => {
  const [dbData, setDbData] = useState([]);
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
  const { formData } = useFormData();
  
  const navigate = useNavigate();
  // const prenexIcons = document.querySelectorAll(".calendar-navigation span");
  useEffect(() => {
    if(selectedUser)
    {
      axios
      .post("/api/getEmployees", { email: formData.email })
      .then((response) => {
        if (response.data.numemployees > 0) {
          setEmployees(response.data.employees);
          //handleData(); // Fetch data immediately after getting employees
        } else {
          navigate("/reportsmenu");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        navigate("/reportsmenu");
      });}
      else
      {
        navigate("/reportsmenu")
      }
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    if (employees.length!==0) {
    handleData();
    setTimeout(() => {
      setLoading(false);
    }, 
    700);
  }
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

  const tableToCSV = () => {
 
    // Variable to store the final csv data
    let csv_data = [];

    // Get each row data
    let rows = document.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {

        // Get each column data
        let cols = rows[i].querySelectorAll('td,th');

        // Stores each csv row data
        let csvrow = [];
        for (let j = 0; j < cols.length; j++) {
          if (cols[j].innerHTML.includes('img'))
            {
              csvrow.push("X");
            }
            else{
              csvrow.push(cols[j].innerHTML);
            }
            // Get the text data of each cell
            // of a row and push it to csvrow
        }

        // Combine each column value with comma
        csv_data.push(csvrow.join(","));
    }

    // Combine each row data with new line character
    csv_data = csv_data.join('\n');

    // Call this function to download csv file  
    downloadCSVFile(csv_data);

}

const downloadCSVFile = (csv_data) => {

    // Create CSV file object and feed
    // our csv_data into it
    let CSVFile = new Blob([csv_data], {
        type: "text/csv"
    });

    // Create to temporary link to initiate
    // download process
    let temp_link = document.createElement('a');

    // Download csv file
    temp_link.download = `${selectedUser}-${startOfWeek}-${endOfWeek}.csv`;
    let url = window.URL.createObjectURL(CSVFile);
    temp_link.href = url;

    // This link should not be displayed
    temp_link.style.display = "none";
    document.body.appendChild(temp_link);

    // Automatically click the link to
    // trigger download
    temp_link.click();
    document.body.removeChild(temp_link);
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
                Weekly Report
              </h1>
            </div>
            <hr className="reports-hr"></hr>
            <div className="detailed-load-div" style={{ overflowY: "auto" }}>
            <div className="loader"></div>
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
              <h1 className="reports-title">Weekly Report ({selectedUser})</h1>
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
            <div className="detailed-table-div" style={{ overflowY: "auto" }}>
            {dbData.length !== 0 && (<table>
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
                        <td> {dbData && selectedWeeklyCounter("In Office")}</td>
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
              </table>)
        }
              
            </div>
            <div style={{ display: "flex", justifyContent: "end", gap: "15px" }}>
            <button className="back-button" onClick={tableToCSV}>Export</button>
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
