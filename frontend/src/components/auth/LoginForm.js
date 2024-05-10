import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import ibmEye from "../../img/ibm eye.png";
import ibmLogo from "../../img/IBM-Logo.jpg";
import { Link } from "react-router-dom";

// LoginForm component
const LoginForm = ({ updateFormData }) => {
  // State for email and location 
  const [formData, setFormData] = useState({ email: '', location: false});
  // State for password
  const [password, setPassword] = useState("");
  // State for error message
  const [errorMessage, setErrorMessage] = useState("");
  // Hook for navigation
  const navigate = useNavigate();

  // Function to handle form submission
  const handleSubmit = async (e) => {
    // Prevent default form submission
    e.preventDefault();

    try {
      // Send a POST request to the server
      const response = await axios.post("/api/login", { email: formData.email, password: password });
      // Store token in local storage
      localStorage.setItem("token", response.data.token);

      updateFormData(formData);

      // Redirect to check-in page
      navigate("/checkin");
    } catch (error) {
      // If there is an error with the request, set the error message
      if (error.response) {
        setErrorMessage(error.response.data.error);
      } else {
        // If there is no response, set a generic error message
        setErrorMessage("Login failed. Please try again.");
      }
    }
  };

  const handleEmailChange = (e) => {
      setFormData({ ...formData, email: e.target.value });
  };

  const handlePasswordChange = (e) => {
      setPassword(e.target.value);
  };

  // Function to toggle password visibility
  function passToggle() {
    var x = document.getElementById("password");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

  // Render the login form
  return (
    <div className="login-form-container">
      <div className="login-header">
        <h1 className="header-title">Punch Card</h1>
        <hr className="signin-hr"></hr>
        <img height="45px" alt="" src={ibmLogo} />
      </div>{" "}
      {/* Add styling */}
      <div className="login-form-box">
        <h1 className="login-title">Sign In</h1>
        <h2 className="login-subtitle">Sign in to check into your CIC</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="login-form" >
          <div className="form-group">
            <input
              type="email"
              id="email"
              value={formData.email}
              placeholder="Email"
              onChange={handleEmailChange}
              required
            />
          </div>
          <div id="password-div" className="form-group">
            <input
              type="password"
              id="password"
              value={formData.password}
              placeholder="Password"
              onChange={handlePasswordChange}
              required
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit(e);
              }}
            />
            <button className="eye-button" onClick={passToggle}>
              <img width="24px" alt="" src={ibmEye} />
            </button>
          </div>
          <Link to="/passwordreset" style={{ textDecoration: "none", color: "#0199EF" }}>
            Forgot password?
          </Link>
          <button className="signin-button" onClick={handleSubmit}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

// Export the LoginForm component
export default LoginForm;
