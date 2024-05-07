import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import ibmEye from "../../img/ibm eye.png";
import ibmLogo from "../../img/IBM-Logo.jpg";
import { Link } from "react-router-dom";

// LoginForm component
const EmailForm = () => {
  // State for form inputs
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState("");
  // State for error message
  const [errorMessage, setErrorMessage] = useState("");

  // Function to handle form submission
  const handleSubmit = async (e) => {
    // Prevent default form submission
    e.preventDefault();

    try {
      // Send a POST request to the server
      //const response = await axios.post("/api/login", { email, password });
      // Store token in local storage
      //localStorage.setItem("token", response.data.token);
        setSubmitted(true);
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

  // Render the login form
  return (
    <div className="login-form-container">
      <div className="login-header">
        <h1 className="header-title">Punch Card</h1>
        <hr className="signin-hr"></hr>
        <img height="45px" alt="" src={ibmLogo} />
      </div>{" "}
      <div className="login-form-box">
        <h1 className="login-title">Password Reset</h1>
        <h2 className="login-subtitle">Enter the email for your account</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {submitted ? 
        <h2 className="login-subtitle">
            Password reset request sent
        </h2>
        : <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              id="email"
              value={email}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="signin-button" type="submit">
            Submit
          </button>
        </form>}
      </div>
    </div>
  );
};

// Export the LoginForm component
export default EmailForm;
