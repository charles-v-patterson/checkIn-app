import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CheckInPage.css";

const CheckInPage = () => {
  const [checkInStatus, setCheckInStatus] = useState("Not Checked In");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [isAtWork, setIsAtWork] = useState(false);
  const [location, setLocation] = useState(null);
  const [workLocation, setWorkLocation] = useState(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isOnNetwork, setIsOnNetwork] = useState(null);


  useEffect(() => {

    axios.get('/check-network')
      .then(response => {
        const { onSpecificNetwork } = response.data;
        setIsOnNetwork(onSpecificNetwork);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsOnNetwork(false);
      });

    const fetchCheckInStatus = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const response = await axios.get("/checkin/status", config);
        setCheckInStatus(response.data.status); // Adjust based on your API response
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/login");
        } else {
          setErrorMessage("Failed to fetch check-in status");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckInStatus();
  }, []); // Empty dependency array: fetch only on page load

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

    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }, []);

  const handleCheckIn = () => {
    if (location && workLocation) {
      const distance = getDistanceFromLatLonInKm(
        location.lat,
        location.lng,
        workLocation.lat,
        workLocation.lng
      );

      setHasCheckedIn(true);
      setIsAtWork(distance < 1); // Consider user to be at work if they are less than 2 km away
    }
  };

  /* 
  const handleCheckIn = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.post("/checkin", {}, config);
      setCheckInStatus("Checked In!");
      setIsLoading(false);
      if (location && workLocation) {
        const distance = getDistanceFromLatLonInKm(
          location.lat,
          location.lng,
          workLocation.lat,
          workLocation.lng
        );

        setHasCheckedIn(true);
        setIsAtWork(distance < 1); // Consider user to be at work if they are less than 1 km away
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response && error.response.status === 401) {
        // Handle unauthorized (e.g., redirect to login)
        navigate("/login");
      } else {
        setErrorMessage("Check-in failed. Please try again.");
      }
    }
  };
*/

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

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  return (
    <div className="checkin-page-container">
      <h1 className="title">IBM Monroe CIC Work Check-in App</h1>
      {isLoading && <p>Checking in...</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <p className="location">Current Location: {JSON.stringify(location)}</p>
      <p>{checkInStatus}</p>
      <button
        className="checkin-button"
        onClick={handleCheckIn}
        disabled={isLoading}
      >
        Check In Now
      </button>
      {hasCheckedIn &&
        (isAtWork ? (
          <p className="status">
            You have been checked in and logged as working in the office today.
          </p>
        ) : (
          <p className="status">
            You have been checked in and logged as working remotely today.
          </p>
        ))}
      <hr></hr>
      <h2>Connection: </h2>
      {isOnNetwork === null && <p>Checking network status...</p>}
      {isOnNetwork === true && <p>User is on the specific network.</p>}
      {isOnNetwork === false && <p>User is not on the specific network.</p>}
    </div>
  );
};

export default CheckInPage;
