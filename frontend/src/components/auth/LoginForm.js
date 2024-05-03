import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import ibmEye from "../../img/ibm eye.png"
import ibmLogo from "../../img/IBM-Logo.jpg"
import {Link} from "react-router-dom";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/login", { email, password });
      // Store token
      localStorage.setItem("token", response.data.token);

      // Redirect to check-in page
      navigate("/checkin");
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    }
  };

  function passToggle() {
    var x = document.getElementById("password");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

  return (
    <div className="login-form-container">
      <div className="login-header">
      <h1 className="header-title">Punch Card</h1>
      <hr className="signin-hr"></hr>
      <img height="45px" src={ibmLogo}/>
      </div>
      
      {" "}
      {/* Add styling */}
      <div className="login-form-box">
      <h1 className="login-title">Sign In</h1>
      <h2 className="login-subtitle">Sign in to check into your CIC</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form className="login-form" onSubmit={handleSubmit}>
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
        <div id="password-div" className="form-group">
          <input
            type="password"
            id="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="eye-button" onClick={passToggle}>
            <img width="24px" src={ibmEye}/>
          </button>
        </div>
        <Link to="" style={{ textDecoration: "none", color: "#0199EF"}}>Forgot password?</Link>
        <button className="signin-button" type="submit">Login</button>
      </form>
      </div>
    </div>
  );
};

export default LoginForm;
