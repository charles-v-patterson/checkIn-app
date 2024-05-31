import React, { useState, useEffect, useRef } from "react";
import "./ReportsPages.css";
import ibmLogo from "../../img/IBM-Logo.jpg";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";


// reportsForm component
const ReportsMenu = ({ formData, updateSelectedUser }) => {
  const [dbData, setDbData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [openWSearch, setWOpenSearch] = useState("close");
  const [openMSearch, setMOpenSearch] = useState("close");
  const [selectedUser, setSelectedUser] = useState("");
  // State for error message
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  let weekRef = useRef();
  let monthRef = useRef();

  useEffect(() => {
    axios
      .post("/api/getEmployees", { email: formData.email })
      .then((response) => {
        if (response.data.numemployees > 0) {
          setEmployees(response.data.employees);
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

  // Function to handle form submission
  const handleData = async () => {
    try {
      const response = await axios.post("/api/reports", { employees });
      setDbData(response.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Data error.");
    }
  };
  
  
const searchEmployees = (bar, list) => {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById(bar);
    filter = input.value.toUpperCase();
    ul = document.getElementById(list);
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

  useEffect(() => {
    let handler = (e) => {
      if (!weekRef.current.contains(e.target) && !monthRef.current.contains(e.target)) {
        closeSearch();
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  });

const openWeekSearch =() =>{
  setWOpenSearch("open")
}
const openMonthSearch =() =>{
  setMOpenSearch("open")
}

const closeSearch =() =>{
  setWOpenSearch("close")
  setMOpenSearch("close")
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
      <div className="reports-menu-box">
            <div className="menu-header">
              <h1 className="reports-title">Reports Menu</h1>
            </div>
            <hr className="reports-hr"></hr>
            <div className="menu-div" style={{ overflowY: "auto" }}>
            <Link
                to="/weekreport"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  justifyContent: "end",
                  width: "max-content",
                }}
              >
                <button className="view-button">1 Week (Summary)</button>
              </Link>
            <Link
                to="/fourweekreport"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  justifyContent: "end",
                  width: "max-content",
                }}
              >
                <button className="view-button">4 Week (Summary)</button>
              </Link>
            <button id="one-week-button" className="view-button" onClick={openWeekSearch}>1 Week (Detailed)</button>
            <div id="week-search-div" className={openWSearch} ref={weekRef}>
            <input type="text" id="one-week-search" className="search-bar" onKeyUp={()=>{searchEmployees("one-week-search", "employees-list-week")}} placeholder="Search mployees.."></input>
            <ul id="employees-list-week" className="employees-list">
            {dbData.map((val, key) => {
                    return (
                      <li key={key} onClick={()=> {updateSelectedUser(val.name); navigate("/detailedreport")}}>{val.name}</li>
                    );
                  })}
            </ul>
            </div>
            <button id="month-button" className="view-button" onClick={openMonthSearch}>Monthly</button>
            <div id="month-search-div" className={openMSearch} ref={monthRef}>
            <input type="text" id="month-search" className="search-bar" onKeyUp={()=>{searchEmployees("month-search", "employees-list-month")}} placeholder="Search Employees.."></input>
            <ul id="employees-list-month" className="employees-list">
            {dbData.map((val, key) => {
                    return (
                      <li key={key} onClick={()=> {updateSelectedUser(val.name); navigate("/monthlyreport")}}>{val.name}</li>
                    );
                  })}
            </ul>
            </div>
            </div>
            <hr className="reports-hr"></hr>
            <div style={{ display: "flex", justifyContent: "end", gap: "15px" }}>
            
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
      </div>
    </div>
  );
};

// Export the reportsForm component
export default ReportsMenu;
