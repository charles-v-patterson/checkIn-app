import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Use named import

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = () => {
    const token = localStorage.getItem("token");

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h1>IBM Monroe CIC Work Check-in App</h1>
      <ul>
        <li>
          <Link to="/checkIn/CheckInPage">Check-In</Link>
        </li>
        {isLoggedIn() && ( // Conditional rendering of the logout button
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
