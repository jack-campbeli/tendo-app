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
  // 'State' is data that this component owns and can change. When it changes, React re-renders the component.
  // Format: const [variableName, functionToUpdateIt] = useState(initialValue)
  const [email, setEmail] = useState(''); // Holds the text in the email input
  const [password, setPassword] = useState(''); // Holds the text in the password input
  const [error, setError] = useState(''); // Holds any login error messages to display
  const [isLoading, setIsLoading] = useState(false); // Tracks if the login API call is in progress
  
  // useNavigate Hook: A function from React Router that lets us programmatically change pages.
  const navigate = useNavigate();

  /**
   * handleSubmit Function
   * 
   * This is an "event handler". It's a function that runs in response to a user action, like clicking a button.
   * It's marked `async` because it uses `await` to handle the API call, which takes time.
   */
  const handleSubmit = async (e) => {
    // `e` is the "event" object. It contains information about the form submission.
    e.preventDefault(); // This is crucial! It stops the browser's default behavior of refreshing the page on form submission.
    setError(''); // Reset error message from previous attempts.
    setIsLoading(true); // Set loading to true to disable the button and show "Logging in...".

    try {
      // `fetch` is a browser API for making network requests (like to our backend).
      // `await` pauses the function until the `fetch` request is complete and we get a response.
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST', // We are sending data, so we use the POST method.
        // Headers tell the server what kind of data we're sending.
        headers: { 'Content-Type': 'application/json' },
        // The `body` is the actual data. `JSON.stringify` converts our JavaScript object into a JSON string.
        body: JSON.stringify({ email, password })
      });
      
      // The `response.ok` property is a quick way to check if the HTTP status code is in the 200-299 range (i.e., successful).
      if (!response.ok) {
        // If login failed (e.g., wrong password), the server will send back an error.
        const errorData = await response.json(); // We parse the error message from the server.
        // We `throw` an error to stop the `try` block and jump to the `catch` block below.
        throw new Error(errorData.detail || 'Login failed');
      }
      
      // If the login was successful, we parse the user data from the server's response.
      const data = await response.json();
      
      // `localStorage` is a way to store data in the browser that persists even after the tab is closed.
      // We store user info so they stay logged in if they refresh the page.
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

