import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "./LoginForm.css";

const ProtectedRoute = ({ children }) => {
  const { auth, loading } = useAuth();


  if (loading) {
    return  <div className="load-div" style={{ overflowY: "auto" }}>
    <div className="loader"></div>
    </div> 
  }

  if (!auth.isAuthenticated) {
    window.location.replace('https://localhost:5000/login')
  }

  

  return children;
};

export default ProtectedRoute;
