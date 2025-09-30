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
 * - allowedUserType: (optional) "patient" or "admin" - which user type can access this route
 *                    If not provided, redirects to user's appropriate home page
 * 
 * How it works:
 * 1. Checks if user is logged in (data exists in localStorage)
 * 2. If no allowedUserType, redirects to user's home page
 * 3. If allowedUserType specified, checks if user type matches
 * 4. If authorized, shows the page (children)
 * 5. If not authorized, redirects to appropriate page
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

  // if no allowedUserType OR user type doesn't match, redirect to user's home page
  if (!allowedUserType || user.userType !== allowedUserType) {
    // admin goes to admin page
    if (user.userType === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    // patient goes to latest form page
    if (user.userType === 'patient') {
      return <Navigate to="/forms/latest" replace />;
    }
  }

  // else show the protected page (user is authorized)
  return children;
}

export default ProtectedRoute;

