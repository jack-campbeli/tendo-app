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
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // useNavigate Hook: A function from React Router that lets us programmatically change pages.
  const navigate = useNavigate();

  // handle form submission
  const handleSubmit = async (e) => {
    // `e` is the "event" object.
    e.preventDefault(); // prevent browser from refreshing
    setError(''); 
    setIsLoading(true); 

    try {
     
      // send the login request to the backend
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json(); 
        throw new Error(errorData.detail || 'Login failed');
      }
      
      // If the login was successful, we parse the user data from the server's response.
      const data = await response.json();
      
      // store the user data in the browser's localStorage
      localStorage.setItem('user', JSON.stringify({
        email: data.email,
        userType: data.user_type,
        firstName: data.first_name,
        lastName: data.last_name
      }));
      
      console.log('Login successful:', data);
      
      if (data.user_type === 'admin') {
        navigate('/admin');
      } else {
        navigate('/forms/latest');
      }
      
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // When this form is submitted (by clicking the button), the `handleSubmit` function is called.
    <form onSubmit={handleSubmit} className={styles.login_form}>
      <h2 className={styles.form_title}>Welcome Back</h2>
      <p className={styles.form_subtitle}>Please login to your account</p>

      {/* CONDITIONAL RENDERING: The error message `div` is only created and shown if the `error` state has text in it. */}
      {error && (
        <div className={styles.error_message}>
          {error}
        </div>
      )}

      {/* Reusable Input component for the email field. */}
      <Input
        label="Email"
        type="email"
        id="email-login" // This unique ID is passed to the Input component.
        value={email} // The `value` is tied to our `email` state variable.
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />

      {/* Reusable Input component for the password field. */}
      <Input
        label="Password"
        type="password"
        id="password-login" // This unique ID is also passed down.
        value={password} // The `value` is tied to our `password` state variable.
        onChange={(e) => setPassword(e.target.value)} // When the user types, we update the `password` state.
        placeholder="Enter your password"
        required
      />

      {/* The login button. */}
      <button 
        type="submit" // This tells the browser that clicking this button should submit the form.
        className={styles.login_button}
        // The `disabled` attribute prevents the button from being clicked.
        // We disable it while `isLoading` is true to prevent multiple form submissions.
        disabled={isLoading}
      >

        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

export default LoginForm;

