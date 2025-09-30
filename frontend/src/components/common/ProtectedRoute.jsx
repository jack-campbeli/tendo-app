import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * 
 * This component protects routes by checking if the user is logged in
 * and if they have the correct user type to access the page.
 * 
 * Props:
 * - children: The component to render if the user is authorized
 * - allowedUserType: "patient" or "admin" - which user type can access this route
 * 
 * How it works:
 * 1. Checks if user is logged in (data exists in localStorage)
 * 2. Checks if user type matches the allowed type
 * 3. If authorized, shows the page (children)
 * 4. If not authorized, redirects to appropriate page
 */
function ProtectedRoute({ children, allowedUserType }) {

  // get user data from localStorage
  const userString = localStorage.getItem('user');
  
  // if no user data, redirect to login page
  if (!userString) {
    return <Navigate to="/login" replace />;
  }

  // user string -> JS object (via JSON.parse)
  const user = JSON.parse(userString);

  // if the user type != the allowed type, redirect to the appropriate page
  if (user.userType !== allowedUserType) {

    // admin goes to admin page
    if (user.userType === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    // patient goes to latest form page
    if (user.userType === 'patient') {
      return <Navigate to="/forms/latest" replace />;
    }
  }

  // else show the protected page
  return children;
}

export default ProtectedRoute;

