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
  // useNavigate Hook: A function from React Router that lets us programmatically change pages.
  const navigate = useNavigate();


  const handleLogout = () => {
    // remove user from localStorage
    localStorage.removeItem('user');
    // redirect to login page
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      {/* inner div is used to control width and alignment of header's content */}
      <div className={styles.header_content}>
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