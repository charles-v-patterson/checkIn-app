import React, { useEffect, useState } from "react";
import axios from "axios";
import ibmLogo from "../../img/IBM-Logo.jpg";
import "./PasswordReset.css";
import { useParams } from 'react-router';

// LoginForm component
const EmailForm = () => {
  // State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [authorized, setAuthorized] = useState(false)
  // State for error message
  const [errorMessage, setErrorMessage] = useState("");
  const { auth } = useParams();

  useEffect(() => {
    const isJWT = (str) => {
      const jwtPattern = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
      return jwtPattern.test(str);
    };

    if (auth && isJWT(auth)) {
      axios.post('/api/verifyJWT', { auth })
      .then(response => {
        const id = response.data.decoded.id;
        setEmail(id)
        setAuthorized(true);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  });

  // Function to handle form submission
  const handleEmailSubmit = async (e) => {
    // Prevent default form submission
    e.preventDefault();

    try {
      const response = await axios.post("/api/sendEmail", { email });
      // Store token in local storage
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

  const handlePasswordSubmit = async (e) => {
    // Prevent default form submission
    e.preventDefault();
    try {
      if (password === cpassword){
        const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{12,}$/;
        const isMatch = regex.test(password);
        if (isMatch) {
          const response = await axios.post("/api/passwordReset", { email, password });
          setSubmitted(true);
        }
        else {
          console.log("Password must contain uppercase, lowercase, numbers, special characters, and be at least 12 characters long.")
          setErrorMessage("Password must contain uppercase, lowercase, numbers, special characters, and be at least 12 characters long.");
        }
      }
      else {
        console.log("Passwords do not match.")
        setErrorMessage("Passwords do not match");
      }
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
      <div className="reset-form-box">
        {authorized && submitted &&
          <h2 className="login-subtitle"> Password reset</h2>
        }
        {authorized && !submitted &&
          <div className="change-password-box">
            <h2 className="login-title"> Password reset</h2>
            <h2 className="login-subtitle"> Please enter a new password for Punch Card</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form className="login-form" onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  id="textbox"
                  value={password}
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <input
                  type="text"
                  id="textbox"
                  value={cpassword}
                  placeholder="Confirm Password"
                  onChange={(e) => setCPassword(e.target.value)}
                  required
                />
              </div>
              <button className="signin-button" type="submit">
                Submit
              </button>
            </form>
          </div>
        }
        {!authorized && 
        <div className="email-form-box">
          <h1 className="login-title">Password Reset</h1>
          
          
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {submitted ? 
            <h1 className="login-subtitle"> Password reset request sent </h1>
            : 
            <form className="login-form" onSubmit={handleEmailSubmit}>
              <h2 className="login-subtitle">Enter the email address associated with your account and<br/>we'll send you a link to reset your password</h2>
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
            </form>
          }
        </div>
        }
      </div>
    </div>
  );
};

// Export the EmailForm component
export default EmailForm;