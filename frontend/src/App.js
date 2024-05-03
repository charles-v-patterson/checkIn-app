import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegistrationForm from "./components/auth/RegistrationForm";
import LoginForm from "./components/auth/LoginForm";
import CheckInPage from "./components/checkIn/CheckInPage";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Use named import
import axios from 'axios';

import Navbar from "./components/common/Navbar";

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

  return (
    <BrowserRouter>
      <Navbar /> {/* Navbar component to display navigation links */}
      <div className="container">
        {" "}
        {/* Container for the main content of the app */}
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn() ? (
                <Navigate to="/checkin" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/checkin"
            element={isLoggedIn() ? <CheckInPage /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
