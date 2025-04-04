import React, { useState, useEffect, useRef } from "react";
import "./Settings.css";
import ibmLogo from "../../img/IBM-Logo.jpg";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useFormData } from '../context/FormDataContext';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from "jwt-decode";

// settingsForm component
const Settings = ({ updateSelectedUser }) => {
  const [dbData, setDbData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [aOpenSearch, setAOpenSearch] = useState("close");
  const [rOpenSearch, setROpenSearch] = useState("close");
  const [openAddConfirm, setOpenAddConfirm] = useState(false);
  const [openRemoveConfirm, setOpenRemoveConfirm] = useState(false);
  const [openBenchEdit, setOpenBenchEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUserData, setSelectedUserData] = useState({});
  const [isManager, setIsManager] = useState(false);
  const [notifsEnabled, setNotifsEnabled] = useState();
  const [isLoading, setLoading] = useState(true);
  const { auth } = useAuth();
  const { formData, updateFormData, browserToken } = useFormData();
  const [localEmail, setLocalEmail] = useState(formData.email);
  // State for error message
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  let addRef = useRef();
  let removeRef = useRef();

  useEffect(() => {

    const getUser = () => {
      const storedToken = localStorage.getItem("auth");
      let decodedToken = storedToken ? jwtDecode(storedToken) : null;

      if (!decodedToken && auth.isAuthenticated) {
        // no token in local storage but user is authenticated? store the auth object
        localStorage.setItem("auth", browserToken);
        decodedToken = jwtDecode(browserToken);
      }
    
      if (decodedToken && decodedToken.id.isAuthenticated) {
        setLocalEmail(decodedToken.id.user.id);
      }
    }

    getUser();

  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    handleData();
  }, [openBenchEdit]);

  useEffect(() => {
    if (localEmail) {
      updateFormData({ ...formData, email: localEmail });
    }
  }, [localEmail, updateFormData]);
  
  useEffect(() => {
    getEmployeeData();

    axios
      .post("/api/getNotificationsEnabled", { email: formData.email })
      .then((response) => {
        setNotifsEnabled(response.data.enabled);
      })
      .catch((error) => {
        console.error("Error: ", error);
        navigate("/");
      });
  }, [formData.email]);

  useEffect(() => {
    handleData();
    setTimeout(() => {
      setLoading(false);
    }, 
    700);
  }, [employees]);

  useEffect(() => {
    setErrorMessage(""); 
    setOpenAddConfirm(false); 
    setOpenRemoveConfirm(false); 
    setSelectedUser(""); 
    setSelectedUserData({}); 
  }, [isManager]);

  const getEmployeeData = async () => {
    axios
    .post("/api/getEmployees", { email: formData.email })
    .then((response) => {
      if (response.data.numemployees > 0) {
        setEmployees(response.data.employees);
        setIsManager(true);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      navigate("/");
    });
  }

  const resetPage = async () => {
    getEmployeeData();
    setErrorMessage(""); 
    setOpenRemoveConfirm(false); 
    setOpenAddConfirm(false); 
  }

  // Function to handle form submission
  const handleData = async () => {
    try {
      const response = await axios.post("/api/reports", { employees });
      setDbData(response.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Data error.");
    }
  };

  const getUserInfo = async () => {
    axios
    .post("/api/getUserByUID", { uid: document.getElementById("add-input").value })
    .then((response) => {
      setSelectedUser(response.data.name);
      setSelectedUserData(response.data);
    })
    .catch((error) => {
      if (error.response.status === 400) {
        setErrorMessage("Invalid Talent ID");
      }
      setOpenAddConfirm(false);
    });
  }

  const handleRemove = () => {
    axios
    .post("/api/remove", {authemail: formData.email, email: selectedUserData.email})
    .then(() => {
      setErrorMessage("User successfully removed");
    })
    .catch((error) => {
      if (error.response.status === 401) {
        setErrorMessage("You are not authorized to remove this user");
      }
      setOpenRemoveConfirm(false);
    });
  };

  const handleAdd = () => {
    axios
    .post("/api/register", {uid: selectedUserData.uid, email: selectedUserData.email, password: "abcABC123!!!", name: selectedUserData.name, manager: formData.email })
    .then(() => {
      setErrorMessage("User successfully added");
    })
    .catch((error) => {
      if (error.response.status === 400) {
        setErrorMessage(`Talent id ${selectedUserData.uid} already registered`);
      }
      setOpenAddConfirm(false);
    });
  };

  const handleNotifs = () => {
    axios
      .post("/api/toggleNotifications", { email: formData.email })
      .then(() => {
        setNotifsEnabled(!notifsEnabled);
      })
      .catch((error) => {
        console.error("Error:", error);
        navigate("/");
      });
  };

  const handleBench = ( email ) => {
    axios
      .post("/api/toggleBench", { email: email })
      .catch((error) => {
        console.error("Error:", error);
        navigate("/");
      });

  };

  const handleActive = ( email ) => {
    axios
      .post("/api/toggleActive", { email: email })
      .catch((error) => {
        console.error("Error:", error);
        navigate("/");
      });

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
  };

  useEffect(() => {
    let handler = (e) => {
     if(!openAddConfirm && !openRemoveConfirm && isManager && !openBenchEdit && errorMessage === "")
      { if (
        !addRef.current.contains(e.target) &&
        !removeRef.current.contains(e.target)
      ) {
        closeSearch();
      }}
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  });

  const openAddSearch = () => {
    setAOpenSearch("open");
  };
  const openRemoveSearch = () => {
    setROpenSearch("open");
  };

  const closeSearch = () => {
    setAOpenSearch("close");
    setROpenSearch("close");
  };

  if (isLoading) {
    return (
      <div className="settings-load-div" style={{ overflowY: "auto" }}>
      <div className="loader"></div>
    </div>
    )
  }

  // Render the settings form
  return (
    <div className="settings-form-container">
      <div className="settings-header">
        <h1 className="header-title">Punch Card</h1>
        <hr className="signin-hr"></hr>
        <img height="45px" alt="" src={ibmLogo} />
      </div>{" "}
      {/* Add styling */}
      <div className="settings-menu-box">
        <div className="menu-header">
        <h1 className="settings-title">{openBenchEdit ? "Manage Resourses" : "Settings"}</h1>
        </div>
        <hr className="settings-hr"></hr>
        {openBenchEdit ? (
          <>
          <table className="bench-body">
                  <tbody>
                    <tr>
                      <th>Name</th>
                      <th>Bench Status</th>
                      <th>Active Status</th>
                    </tr>
                  
                  {dbData.map((val, key) => {
                    return (
                      <tr key={key} id="four-week-row" className="bench-table">
                        <td>{val.name}</td>
                        <td>
                          <label className="switch">
                            <input type="checkbox" defaultChecked={val.bench} onClick={()=>{handleBench(val._id)}}/>
                            <span className="slider round"></span>
                          </label>
                        </td>
                        <td>
                          <label className="switch">
                            <input type="checkbox" defaultChecked={val.bench} onClick={()=>{handleActive(val._id)}}/>
                            <span className="slider round"></span>
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
          <div style={{ display: "flex", justifyContent: "end", gap: "15px" }}>
        <button className="back-button" onClick={()=>{setOpenBenchEdit(false)}}>Back</button>
    </div>
          </>
          ) : (
            <>
              <div className="menu-div" style={{ overflowY: "auto" }}>
        
        {errorMessage !== "" ? (<>
          <h1 className="settings-title">{errorMessage}</h1>
          <button className="view-button" onClick={()=>{resetPage();}}>
            {errorMessage === "User successfully removed" || errorMessage === "User successfully added" ? "To Menu": "Cancel"}
          </button>
          </>)
            : openAddConfirm ? (<>
            <h1 className="settings-title">Are you sure you want to add this user?</h1>
            <h2 className="settings-sub-title">{selectedUserData.email}</h2>
            <h2 className="settings-sub-title">{selectedUser}</h2>
            <button className="view-button" onClick={() => {handleAdd(selectedUserData.email)}}>
            Add
          </button>
          <button className="view-button" onClick={()=>{setOpenAddConfirm(false); setSelectedUser(""); setSelectedUserData({});}}>
            Cancel
          </button>
        </>) 
         :openRemoveConfirm? (<>
        <h1 className="settings-title">Are you sure you want to remove this user?</h1>
        <h2 className="settings-sub-title">{selectedUserData.email}</h2>
        <h2 className="settings-sub-title">{selectedUser}</h2>
            <button className="view-button" onClick={() => {handleRemove(selectedUserData.email)}}>
            Remove
          </button>
          <button className="view-button" onClick={()=>{setOpenRemoveConfirm(false); setSelectedUser(""); setSelectedUserData({});}}>
            Cancel
          </button>
        </>) : (<>
            <button
        id="notifs-button"
        className="view-button"
        onClick={handleNotifs}
      >
        {notifsEnabled ? "Disable Reminders" : "Enable Reminders"}
      </button>

      {isManager && (
        <>
          <button className="view-button" onClick={openAddSearch}>
            Add User
          </button>
          <div id="add-search-div" className={aOpenSearch} ref={addRef}>
            <input
              type="text"
              id="add-input"
              className="search-bar"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setOpenAddConfirm(true);
                  getUserInfo();
                }
              }}
              placeholder="Talent ID.. "
            ></input>
          </div>
          <button
            id="remove-button"
            className="view-button"
            onClick={openRemoveSearch}
          >
            Remove User
          </button>
          <div
            id="remove-search-div"
            className={rOpenSearch}
            ref={removeRef}
          >
            <input
              type="text"
              id="edit-search"
              className="search-bar"
              onKeyUp={() => {
                searchEmployees("edit-search", "employees-list-week");
              }}
              placeholder="Search Employees.."
            ></input>
            <ul id="employees-list-week" className="employees-list">
              {dbData.map((val, key) => {
                return (
                  <li key={key} onClick={()=>{
                    setSelectedUser(val.name);
                    setSelectedUserData({uid: val.uid, name: val.name, email: val._id});
                    setOpenRemoveConfirm(true);
                    }}>
                      {val.name}
                  </li>
                );
              })}
            </ul>
          </div>
          <button className="view-button" onClick={()=> {setOpenBenchEdit(true)}}>
          Manage Resouces
          </button>
        </>
      )}
        </>)}
      
    </div>

    <hr className="settings-hr"></hr>
    <div style={{ display: "flex", justifyContent: "end", gap: "15px" }}>
    <button className="back-button" onClick={() => navigate(-1)}>Back</button>
    </div>
            </>
          )}
      </div>
    </div>
  );
};

// Export the settingsForm component
export default Settings;
