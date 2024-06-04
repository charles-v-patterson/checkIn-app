import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { auth, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or return null or a spinner
  }

  if (!auth.isAuthenticated) {
    //return <Navigate to="/" />
    window.location.replace('https://localhost:5000/login');
  }

  return children;
};

export default ProtectedRoute;
