import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './Header.module.css';

/**
 * Header Component
 * 
 * A reusable header component that displays at the top of pages.
 * Shows the page title, optional language selector, and a logout button.
 * 
 * Props:
 * - title: The text to display in the header (e.g., "Admin Dashboard")
 * - showLanguageSelector: Boolean to control whether language selector is shown (default: true)
 */
function Header({ title, showLanguageSelector = true }) {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.header_content}>
        
        {/* Language selector dropdown */}
        {showLanguageSelector && (
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={styles.language_selector}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        )}
        
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