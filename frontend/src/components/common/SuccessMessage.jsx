import React from 'react';
import styles from './SuccessMessage.module.css';

/**
 * SuccessMessage Component
 * 
 * Displays a professional success message after a form is created.
 * Shows the form ID and shareable URL.
 * 
 * Props:
 * - formId: The ID of the newly created form
 * - onStartNewForm: Callback function to reset and start creating another form
 */
function SuccessMessage({ formId, onStartNewForm }) {
  return (
    <div className={styles.success_card}>
      <div className={styles.icon_container}>
        {/* SVG checkmark icon - lightweight and scales perfectly */}
        <svg 
          className={styles.check_icon} 
          viewBox="0 0 24 24" /* Defines the SVG's coordinate system (a 24x24 canvas) to ensure it scales correctly */
          fill="none" /* Ensures the inside of the checkmark is transparent */
          stroke="currentColor" /* Sets the line color to inherit the text color from its parent CSS */
        >
          <path 
            strokeLinecap="round" /* Makes the ends of the checkmark line rounded */
            strokeLinejoin="round" /* Makes the corner of the checkmark line rounded */
            strokeWidth={2} /* Sets the thickness of the checkmark line */
            d="M5 13l4 4L19 7" /* The path data drawing the checkmark shape */
          />
        </svg>
      </div>
      
      <h3 className={styles.success_title}>Form Created Successfully</h3>
      <p className={styles.success_subtitle}>Your form has been saved and is ready to share</p>
      
      <div className={styles.info_section}>
        <div className={styles.info_item}>
          <label className={styles.info_label}>Form ID</label>
          <code className={styles.code_block}>{formId}</code>
        </div>
        
        <div className={styles.info_item}>
          <label className={styles.info_label}>Form URL</label>
          <code className={styles.code_block}>
            http://localhost:5173/forms/{formId}
          </code>
        </div>
      </div>
      
      {/* Callback prop to communicate action back to parent component */}
      <button 
        onClick={onStartNewForm}
        className={styles.btn_primary}
      >
        Create Another Form
      </button>
    </div>
  );
}

export default SuccessMessage;

