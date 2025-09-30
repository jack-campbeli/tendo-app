import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

/**
 * Header Component
 * 
 * A reusable header component that displays at the top of pages.
 * Shows the page title and a logout button.
 * 
 * Props:
 * - title: The text to display in the header (e.g., "Admin Dashboard")
 */
function Header({ title }) {
  // useNavigate Hook: Allows us to redirect users to different pages
  const navigate = useNavigate();

  /**
   * handleLogout Function
   * 
   * Logs the user out by:
   * 1. Removing user data from localStorage
   * 2. Redirecting to the login page
   */
  const handleLogout = () => {
    // Remove user info from localStorage (clears the session)
    localStorage.removeItem('user');
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.header_content}>
        {/* Right side: Logout button */}
        <button 
          onClick={handleLogout}
          className={styles.logout_button}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;

