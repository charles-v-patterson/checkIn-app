import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const W3LoginForm = () => {

  const { setAuth } = useAuth();

  const handleLogin = async () => {
    try {
      // Redirect to the backend /login endpoint
      window.location.href = 'https://localhost:5000/login';
    } catch (error) {
      console.error('Error during login:', error);
      // Handle error appropriately
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/check_logged_into_w3');
        if (response.data.isAuthenticated) {
          setAuth(response.data);
          localStorage.setItem('auth', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuth();

  }, [setAuth]);

  // useEffect(() => {
  //   const token = localStorage.getItem("auth");
  //   setFormData({...formData, email: response.data.user.id})
  //   updateFormData(formData);
  // }, []);

  return (
    <div className='login-form-container'>
        <div className="login-form-box">
            <h1 className="login-title">Login with W3</h1>
            <button className="signin-button" onClick={handleLogin}>
                    Login with W3
                </button>
        </div>
    </div>
  );
};

export default W3LoginForm;
