/*
  This component is the main component for the Check-In page. It contains the logic to check 
  if the user is at work or not based on their current location and the work location. It also 
  contains the logic to calculate the distance between the user's current location and the work 
  location. The user can click the "Check In Now" button to check in and the app will display a 
  message based on whether the user is at work or not.
*/
import React, { useState, useEffect } from "react";
import "./CheckInPage.css"; // Import the CSS file
import ibmLogoPNG from "../../img/ibm-logo-transparent.png";
import settingsIcon from "../../img/settings-icon-white.png";
import { Link } from "react-router-dom";
import axios from 'axios';
import { useFormData } from '../context/FormDataContext';
import { useAuth } from '../context/AuthContext';

// CheckInPage component
const CheckInPage = () => {
  // State for email and location 
  const [isAtWork, setIsAtWork] = useState(false);
  const [isOnNetwork, setIsOnNetwork] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [location, setLocation] = useState(null);
  const [workLocation, setWorkLocation] = useState(null);
  const [buttonClicked, setButtonClicked] = useState(false);
  // handling form data
  const { auth, setAuth } = useAuth();
  const { formData, updateFormData } = useFormData();
  const [localEmail, setLocalEmail] = useState(formData.email);
  const [localLocation, setLocalLocation] = useState(formData.location);
  
  // State for error message
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch the work location and user's current location
  useEffect(() => {
    const fetchWorkLocation = async () => {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=150+Venable+Lane,+Monroe,+Louisiana&key=AIzaSyAPwjOR90GtwlHzTmqJjvzmZVyXgA1z4PY`
      );
      const data = await response.json();
      const location = data.results[0].geometry.location;
      setWorkLocation(location);
    };

    fetchWorkLocation();

    // Get the user's current location
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const address = await getAddress(lat, lng);
      setLocation({
        lat: lat,
        lng: lng,
        address: address,
      });
    });
    
    axios.get('/api/check-network')
    .then(response => {
      const { onNetwork } = response.data;
      setIsOnNetwork(onNetwork);
      setLocalLocation(onNetwork);
    })
    .catch(error => {
      console.error('check-network Error:', error);
      setIsOnNetwork(false);
    });

    const getUser = () => {
      const storedToken = localStorage.getItem("auth");
      let token = storedToken ? JSON.parse(storedToken) : null;
    
      if (!token && auth.isAuthenticated) {
        // no token in local storage but user is authenticated? store the auth object
        localStorage.setItem('auth', JSON.stringify(auth));
        token = auth;
      }
    
      if (token && token.isAuthenticated) {
        setLocalEmail(token.user.id);
      }
    
      console.log("Token: ", token);
    }

    getUser();

  }, []);

  useEffect(() => {
    if (localEmail) {
      updateFormData({ email: localEmail, location: localLocation });
    }
  }, [localEmail, localLocation, updateFormData]);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (formData.email) {
        try {
          const response = await axios.post('/api/getEmployees', { email: formData.email });
          setIsManager(response.data.numemployees !== 0);
        } catch (error) {
          console.error('Error fetching employees:', error);
        }
      }
    };

    fetchEmployees();
  }, [formData.email]);

  // Function to handle the check-in button click
  const handleCheckIn = async () => {
    if (location && workLocation) {
      const distance = getDistanceFromLatLonInKm(
        location.lat,
        location.lng,
        workLocation.lat,
        workLocation.lng
      );

      // Check if the user is at work based on the distance
      setIsAtWork(distance < 1.5); // Consider user to be at work if they are less than 0.3 km away
      setLocalLocation(distance < 1.5);
      
      try {
        // Send a POST request to the server
        await axios.post("/api/checkin", { formData });
      } catch (error) {
        // If there is an error with the request, set the error message
        if (error.response) {
          setErrorMessage(error.response.data.error);
        } else {
          // If there is no response, set a generic error message
          setErrorMessage("Check in failed. Please try again.");
        }
      }

    }

    else if (isOnNetwork) {
      try {
        // Send a POST request to the server
        await axios.post("/api/checkin", { formData });
      } catch (error) {
        // If there is an error with the request, set the error message
        if (error.response) {
          setErrorMessage(error.response.data.error);
        } else {
          // If there is no response, set a generic error message
          setErrorMessage("Check in failed. Please try again.");
        }
      }
    }

    console.log(formData);
    // Set the button clicked state to true
    setButtonClicked(true);
  };

  

  const getAddress = async (lat, lng) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyAPwjOR90GtwlHzTmqJjvzmZVyXgA1z4PY`
    );
    const data = await response.json();
    return data.results[0].formatted_address;
  };

  // Function to calculate distance between two coordinates
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  };

  // Function to convert degrees to radians
  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Render the CheckInPage component
  return (
    <div className="checkin-page-container">
      <div className="checkin-header">
      <h1 className="title">Punch Card</h1>
        <hr className="signin-hr"></hr>
        <img height="90x" alt="" src={ibmLogoPNG} />
      </div>
      <hr className="checkin-hr"></hr>
      {" "}
      {/* Add styling */}
      <div className="checkin-form-box">
        {buttonClicked && (
          <>
            <p className="location">
              Location Logged: Coordinates: ({location?.lat}, {location?.lng}) /
              Physical Address: {location?.address}
            </p>
            {isAtWork ? (
              <p className="status">
                Thanks! You have been checked in and logged as working in the
                office today.
              </p>
            ) : isOnNetwork ? (
              <p className="status">
                Thanks! You have been checked in and logged as working in the
                office today.
              </p>
            ): (
              <p className="status">
                Thanks! You have been checked in and logged as working remotely
                today.
              </p>
            )}
          </>
        )}
        {!buttonClicked && (
          <button className="checkin-button" onClick={handleCheckIn}>
            Check In
          </button>
        )}
        {isManager && (<Link to="/reportsmenu" style={{ display: "flex", justifyContent: "center", textDecoration: "none"}}>
        <button className="reports-button" >
            Reports
          </button>
          </Link>)
        }
      </div>
      <Link to="/settings" style={{ position: "absolute", bottom: "20px", right: "20px", display: "flex", justifyContent: "center", textDecoration: "none"}}>
      <button className="settings-button" >
        <img height="25x" alt="" src={settingsIcon} />
          </button>
          </Link>
    </div>
  );
};

// Export the CheckInPage component
export default CheckInPage;
