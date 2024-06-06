import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from "axios";
import { useAuth } from '../context/AuthContext';
import "./LoginForm.css";

const ProtectedRoute = ({ children }) => {
  const { auth, loading } = useAuth();
  const [dbStatus, setDbStatus] = useState({});
  
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const response = await axios.get("/api/check_if_in_database");
        setDbStatus(response.data);
      } catch (error) {
        console.error('Error checking db status:', error);
      }
    };

    checkDbStatus();
  }, [loading]);

  if (loading) {
    return  <div className="load-div" style={{ overflowY: "auto" }}>
    <div className="loader"></div>
    </div> 
  }

  if (!auth.isAuthenticated) {
    //return <Navigate to="/" />
    window.location.replace('https://localhost:5000/login');
  }

  if (auth.isAuthenticated && !dbStatus.inDatabase) {
    console.log(dbStatus);
    return <Navigate to="/401" />
  }

  return children;
};

export default ProtectedRoute;
