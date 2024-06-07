import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ isAuthenticated: false, user: null });
  const [loading, setLoading] = useState(true);
  const [browserToken, setToken] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/check_logged_into_w3');
        setToken(response.data);
        setAuth(jwtDecode(response.data).id);
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, loading, browserToken }}>
      {children}
    </AuthContext.Provider>
  );
};
