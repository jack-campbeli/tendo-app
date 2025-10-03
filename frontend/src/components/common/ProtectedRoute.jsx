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
 */
function ProtectedRoute({ children, allowedUserType }) {

  // get user from localStorage
  const userString = localStorage.getItem('user');
  
  // no user, redirect to login
  if (!userString) {
    return <Navigate to="/login" replace />; // replace navigates in place
  }

  // JSON string -> JS object
  const user = JSON.parse(userString);

  // Map user types to their home pages
  const userTypeRoutes = {
    admin: '/admin',
    patient: '/forms/latest'
  };
  
  // If there's no allowed user type OR the user's type doesn't match,
  // redirect the current user to their own home page.
  if (!allowedUserType || allowedUserType && user.userType !== allowedUserType) {
    return <Navigate to={userTypeRoutes[user.userType]} replace />;
  }

  // else, all checks pass, render the children
  return children;
}

export default ProtectedRoute;