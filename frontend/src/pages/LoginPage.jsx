import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import './LoginPage.css';

/**
 * LoginPage Component
 * 
 * This is the main login page that users will see.
 * It's a "page" component, so it focuses on layout and structure.
 * The actual login logic is in the LoginForm component.
 * 
 * This separation follows the "separation of concerns" principle:
 * - Pages handle layout and overall structure
 * - Components handle specific functionality
 */
function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-container">
        {/* The LoginForm component handles all the login functionality */}
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;

