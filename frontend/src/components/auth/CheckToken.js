// AuthProvider.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const TokenContext = createContext();

const CheckToken = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/check-token')
    .then(response => {
        const { validToken } = response.data;
        setIsValidToken(validToken);
    })
    .catch(error => {
      console.error('Check Token Error:', error);
      setIsValidToken(false);
    })

    const token = localStorage.getItem('token');
    if (token) {
      if (isValidToken) {
        setIsLoggedIn(true);
      } else {
        // Token is invalid, redirect to login page
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        navigate("/"); // Redirect to login page
      }
    } else {
      setIsLoggedIn(false);
      navigate("/"); // Redirect to login page
    }
  }, []);

  return (
    <TokenContext.Provider value={{ isLoggedIn }}>
      {children}
    </TokenContext.Provider>
  );
};

export { CheckToken, TokenContext };
