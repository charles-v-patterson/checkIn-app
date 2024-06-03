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
const MonthlyReport = ({ selectedUser }) => {
  const [dbData, setDbData] = useState([]);
  const [monthTrigger, setMonthTrigger] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setLoading] = useState(true); 
  const [lit, setLit] = useState("<tr>");
  // State for error message
  const [errorMessage, setErrorMessage] = useState("");
  const [monthsBack, setMonthsBack] = useState(0);
  const [arrowRDisable, setArrowRDisable] = useState("arrow-end");
  const [arrowLDisable, setArrowLDisable] = useState("arrow-button");
  let date = new Date();
  let year = date.getFullYear();
  const [monthTemp, setMonthTemp] = useState(date.getMonth());
  const [yearTemp, setYearTemp] = useState(date.getFullYear());
  const navigate = useNavigate();
  const { formData } = useFormData();
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
          let pushedString = "";
          let strFirst2 = cols[j].innerHTML.substring(0,2);
          if (strFirst2.includes('<')){
            pushedString = strFirst2.substring(0,1);
          }
          else if(cols[j].innerHTML.includes('day')){
            pushedString = cols[j].innerHTML;
          }else{
            pushedString = strFirst2;
          }
          if (cols[j].innerHTML.includes('In Office'))
            {
              pushedString = pushedString + ": In Office";
            }
            else if(cols[j].innerHTML.includes('Remote')){
              pushedString = pushedString + ": Remote";
            }
            csvrow.push(pushedString);
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
    temp_link.download = `${selectedUser}-${months[monthTemp]} ${yearTemp}.csv`;
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
export default MonthlyReport;
