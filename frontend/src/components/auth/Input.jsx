import React from 'react';
import styles from './Input.module.css';

/**
 * Input Component
 * 
 * A reusable input field component that can be used for different types of inputs.
 * This makes our code DRY (Don't Repeat Yourself) - we write it once, use it many times!
 * 
 * Props (properties passed from parent component):
 * - label: The text shown above the input field
 * - type: What kind of input (email, password, text, etc.)
 * - value: The current value of the input
 * - onChange: Function to call when the input changes
 * - placeholder: Hint text shown inside the input when empty
 * - required: Whether this field must be filled out
 */
function Input({ label, type, value, onChange, placeholder, required }) {
  return (
    <div className={styles.input_container}>
      {/* Label tells users what the input is for */}
      <label className={styles.input_label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      
      {/* The actual input field */}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={styles.input_field}
      />
    </div>
  );
}

export default Input;

