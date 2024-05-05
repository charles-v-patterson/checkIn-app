/*
  This component is the main component for the Check-In page. It contains the logic to check 
  if the user is at work or not based on their current location and the work location. It also 
  contains the logic to calculate the distance between the user's current location and the work 
  location. The user can click the "Check In Now" button to check in and the app will display a 
  message based on whether the user is at work or not.
*/
import React, { useState, useEffect } from "react";
import "./CheckInPage.css"; // Import the CSS file

// CheckInPage component
const CheckInPage = () => {
  const [isAtWork, setIsAtWork] = useState(false);
  const [location, setLocation] = useState(null);
  const [workLocation, setWorkLocation] = useState(null);
  const [buttonClicked, setButtonClicked] = useState(false);

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
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }, []);

  // Function to handle the check-in button click
  const handleCheckIn = () => {
    if (location && workLocation) {
      const distance = getDistanceFromLatLonInKm(
        location.lat,
        location.lng,
        workLocation.lat,
        workLocation.lng
      );

      // Check if the user is at work based on the distance
      setIsAtWork(distance < 0.3); // Consider user to be at work if they are less than 0.3 km away
    }
    // Set the button clicked state to true
    setButtonClicked(true);
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
    <div className="app">
      <h1 className="title">IBM Monroe CIC Work Check-in App</h1>
      {buttonClicked && (
        <>
          <p className="location">
            Current Location: {JSON.stringify(location)}
          </p>
          {isAtWork ? (
            <p className="status">
              You have been checked in and logged as working in the office
              today.
            </p>
          ) : (
            <p className="status">
              You have been checked in and logged as working remotely today.
            </p>
          )}
        </>
      )}
      <button className="checkin-button" onClick={handleCheckIn}>
        Check In Now
      </button>
    </div>
  );
};

// Export the CheckInPage component
export default CheckInPage;
