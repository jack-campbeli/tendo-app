import React from 'react';
import styles from './SuccessMessage.module.css';

/**
 * SuccessMessage Component
 * 
 * Displays a professional success message after a form is created.
 * Shows the form ID and shareable URL.
 */
class SuccessMessage extends React.Component {
  render() {
    const { formId, onCreateAnother } = this.props;
    
    return (
      <div className={styles.success_card}>
        <div className={styles.icon_container}>
          <svg className={styles.check_icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
        
        <button 
          onClick={onCreateAnother}
          className={styles.btn_primary}
        >
          Create Another Form
        </button>
      </div>
    );
  }
}

export default SuccessMessage;

