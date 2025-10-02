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

  // get user from localStorage
  const userString = localStorage.getItem('user');
  
  // If `userString` is null or undefined (falsy), it means the user is not logged in.
  if (!userString) {
    // We use the `<Navigate>` component from React Router to redirect them to="/login"` is the destination.
    // `replace` prop revents back button from navigating back to the protected page
    return <Navigate to="/login" replace />;
  }

  // JSON string -> JS object
  const user = JSON.parse(userString);

  // Map user types to their home pages
  const userTypeRoutes = {
    admin: '/admin',
    patient: '/forms/latest'
  };
  
  // If there's no allowed user type OR the user's type doesn't match,
  // redirect them to their own home page.

  // !!! REVIEW !!!
  if (!allowedUserType || allowedUserType && user.userType !== allowedUserType) {
    return <Navigate to={userTypeRoutes[user.userType]} replace />;
  }

  // if all checks pass, render the children
  return children;
}

export default ProtectedRoute;