import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from './Input';
import styles from './LoginForm.module.css';

/**
 * LoginForm Component
 * 
 * This component handles the login form logic and presentation.
 * It manages its own state (email and password) and handles form submission.
 * 
 * In React, we use "state" to store data that can change over time.
 * When state changes, React automatically re-renders (updates) the component.
 */
function LoginForm() {
  // useState Hook: Creates state variables
  // Format: const [variableName, functionToUpdateIt] = useState(initialValue)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // useNavigate Hook: Allows us to redirect users to different pages
  const navigate = useNavigate();

  /**
   * handleSubmit Function
   * 
   * This runs when the user clicks the "Login" button.
   * e.preventDefault() stops the browser from refreshing the page (default form behavior)
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Don't refresh the page!
    setError(''); // Clear any previous errors
    setIsLoading(true); // Show loading state

    try {
      // Make API call to backend to authenticate user
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      // Check if login was successful
      if (!response.ok) {
        // If response is not ok (401, 404, 500, etc.), throw an error
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
      
      // Parse the successful response
      const data = await response.json();
      
      // Store user info in localStorage (so it persists across page refreshes)
      localStorage.setItem('user', JSON.stringify({
        email: data.email,
        userType: data.user_type
      }));
      
      console.log('Login successful:', data);
      
      // Redirect based on user type
      if (data.user_type === 'admin') {
        navigate('/admin'); // Admin goes to admin page
      } else {
        navigate('/forms/latest'); // Patient goes to form page
      }
      
    } catch (err) {
      // Show error message to user
      setError(err.message || 'Invalid email or password. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.login_form}>
      <h2 className={styles.form_title}>Welcome Back</h2>
      <p className={styles.form_subtitle}>Please login to your account</p>

      {/* Show error message if there is one */}
      {error && (
        <div className={styles.error_message}>
          {error}
        </div>
      )}

      {/* Email Input */}
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />

      {/* Password Input */}
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
      />

      {/* Submit Button */}
      <button 
        type="submit" 
        className={styles.login_button}
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

export default LoginForm;

