import React, { useState } from 'react';
import axios from 'axios';

const RegistrationForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation 
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return; 
    }

    try {
      const response = await axios.post('/register', { email, password });

      // On success, redirect to login or check-in:
      // window.location.href = '/login'; 
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.error); 
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="registration-form-container"> {/* Add your styling */}
      <h2>Registration</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>} 
      <form onSubmit={handleSubmit}>
        <div className="form-group"> {/* Add styling as needed */}
          <label htmlFor="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        {/* ... Similar input fields for password and confirm password ... */}
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegistrationForm;
