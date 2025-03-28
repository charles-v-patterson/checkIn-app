import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Form } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import W3Login from "./components/auth/W3LoginForm";
import ReportsMenu from "./components/reports/ReportsMenu";
import WeekReport from "./components/reports/WeekReport";
import FourWeekReport from "./components/reports/FourWeekReport";
import DetailedReport from "./components/reports/DetailedReport";
import MonthlyReport from "./components/reports/MonthlyReport";
import ErrorPage from "./components/error/ErrorPage";
import Settings from "./components/settings/Settings";
import CheckIn from "./components/checkIn/CheckInPage";
import { AuthProvider } from './components/context/AuthContext';
import { FormDataProvider } from './components/context/FormDataContext';
import ProtectedRoute from './components/auth/ProtectedRoute'

// Main App component
const App = () => {

  const [formData, setFormData] = useState({});
  const [selectedUser, setSelectedUser] = useState("");
    const updateSelectedUser = (newData) => {
        setSelectedUser(newData);
    };

  // Function to check if a user is logged in
  const isLoggedIn = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return false; // No token found
    }

    try {
      // Decode the token to access payload data
      const decodedToken = jwtDecode(token);

      // Check token expiry
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token"); // Token expired
        return false;
      }

      // set the users email to the email in the token to ensure persistence
      formData.email = decodedToken.id;
      // if page is detailed or decoded.name is valid
      //   then selectedUser = decoded.name

      // Token seems valid
      return true;
    } catch (error) {
      return false; // Invalid token format or other error
    }
  };

  // Render the app component
  return (
    <AuthProvider>
      <FormDataProvider>
        <Router>
          <Routes>
           <Route
              path="/"
              element={
              <ProtectedRoute>
                <CheckIn />
              </ProtectedRoute>
              }
            />
            <Route 
              path="/reportsmenu" 
              element={
              <ProtectedRoute>  
                <ReportsMenu updateSelectedUser={ updateSelectedUser }/>
              </ProtectedRoute>
              }
            />
            <Route 
              path="/weekreport" 
              element={
              <ProtectedRoute>
                <WeekReport updateSelectedUser={ updateSelectedUser }/> 
              </ProtectedRoute>
              }
            />
            <Route 
              path="/fourweekreport" 
              element={
              <ProtectedRoute>
                <FourWeekReport />
              </ProtectedRoute>
              }
            />
            <Route 
              path="/detailedreport" 
              element={
              <ProtectedRoute>
                <DetailedReport selectedUser={ selectedUser } updateSelectedUser={ updateSelectedUser }/>
              </ProtectedRoute>
              }
            />
            <Route 
              path="/monthlyreport" 
              element={
              <ProtectedRoute>
                <MonthlyReport selectedUser={ selectedUser } updateSelectedUser={ updateSelectedUser }/>
              </ProtectedRoute>
              }
              />
            <Route
              path="*"
              element={<ErrorPage errorName={ "404" }/>}
            />
            <Route
              path="/401"
              element={<ErrorPage errorName={ "401" }/>}
            />
            <Route
              path="/settings"
              element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>}
            />
          </Routes>
        
        </Router>
      </FormDataProvider>
    </AuthProvider>
  );
};

// Export the App component
export default App;
