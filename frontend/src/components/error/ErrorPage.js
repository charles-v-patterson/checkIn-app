import React from "react";
import "./ErrorPage.css";
import ibmLogo from "../../img/IBM-Logo.jpg";


// LoginForm component
const ErrorPage = ({ errorName }) => {
  
  // Render the login form
  return (
    <div className="error-container">
      <div className="error-header">
        <h1 className="header-title">Punch Card</h1>
        <hr className="error-hr"></hr>
        <img height="45px" alt="" src={ibmLogo} />
      </div>{" "}
      {/* Add styling */}
      <div className="error-message-box">
      <h1 className="error-title">Error {errorName}</h1>
      <hr className="error-hr"></hr>
      {errorName === "401" ? (
        <>
          <h2 className="error-subtitle">Unauthorized: You are unauthorized to view this page</h2>
        </>) : (<>
          <h2 className="error-subtitle">Page not found: The page you are looking for does not exist</h2>
        </>)}
      </div>
    </div>
  );
};

// Export the LoginForm component
export default ErrorPage;