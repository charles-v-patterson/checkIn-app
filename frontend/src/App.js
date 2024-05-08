/*
  App.js is the main component of the application. It is responsible for routing the user to the 
  correct page based on the URL path. The App component uses the BrowserRouter component from the 
  react-router-dom library to enable routing in the application. The Routes component is used to 
  define the different routes in the application, and the Route component is used to specify the path 
  and the component to render for each route.
*/
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Login from "./components/auth/LoginForm";
import PasswordReset from "./components/auth/PasswordReset";
import CheckIn from "./components/checkIn/CheckInPage";

// Main App component
const App = () => {
  // Function to check if a user is logged in
  const isLoggedIn = () => {
    const token = localStorage.getItem("token");
    console.log("Token status: " + token);
    if (!token) {
      return false; // No token found
    }

    try {
      // Decode the token to access payload data
      const decodedToken = jwtDecode(token);

      // Check token expiry
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token"); // Token expired
        return false;
      }

      // Token seems valid
      return true;
    } catch (error) {
      return false; // Invalid token format or other error
    }
  };

  // Render the app component
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/checkIn"
          element={isLoggedIn() ? <CheckIn /> : <Login />}
        />
        <Route
          path="/passwordreset/:auth?"
          element={<PasswordReset />}
        />
      </Routes>
    </Router>
  );
};

// Export the App component
export default App;
