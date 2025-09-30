import React from 'react';
import styles from './FormField.module.css';

function FormField({ field, index, formData, handleInputChange }) {
  const fieldKey = `${field.id}_${index}`;

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
      case 'tel':
        return (
          <input
            type={field.type}
            id={fieldKey}
            className={styles.form_input}
            value={formData[fieldKey] || ''} // || '' prevents undefined values
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={fieldKey}
            className={styles.form_textarea}
            value={formData[fieldKey] || ''}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            id={fieldKey}
            className={styles.form_select}
            value={formData[fieldKey] || ''}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            required={field.required}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, index) => ( // Optional chaining: safe if options is null
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className={styles.radio_group}>
            {field.options?.map((option, optionIndex) => (
              <div key={`${fieldKey}_${optionIndex}`} className={styles.radio_option}>
                <input
                  type="radio"
                  id={`${fieldKey}_option_${optionIndex}`}
                  name={fieldKey}
                  value={option}
                  checked={formData[fieldKey] === option} // Radio: only one can be selected
                  onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                  required={field.required}
                />
                <label htmlFor={`${fieldKey}_option_${optionIndex}`}>{option}</label>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className={styles.checkbox_group}>
            {field.options?.map((option, optionIndex) => (
              <div key={`${fieldKey}_${optionIndex}`} className={styles.checkbox_option}>
                <input
                  type="checkbox"
                  id={`${fieldKey}_option_${optionIndex}`}
                  value={option}
                  checked={Array.isArray(formData[fieldKey]) && formData[fieldKey].includes(option)} // Checkbox: multiple can be selected
                  onChange={(e) => {
                    const currentValues = Array.isArray(formData[fieldKey]) ? formData[fieldKey] : [];
                    if (e.target.checked) {
                      handleInputChange(fieldKey, [...currentValues, option]); // Add to array
                    } else {
                      handleInputChange(fieldKey, currentValues.filter(v => v !== option)); // Remove from array
                    }
                  }}
                />
                <label htmlFor={`${fieldKey}_option_${optionIndex}`}>{option}</label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            id={fieldKey}
            className={styles.form_input}
            value={formData[fieldKey] || ''}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
          />
        );
    }
  };

  // For radio buttons, the label is handled differently inside the options mapping.
  if (field.type === 'radio' || field.type === 'checkbox') {
    return (
      <>
        <label className={styles.form_label}>
          {field.label}
          {field.required && <span className={styles.required_asterisk}>*</span>}
        </label>
        {renderField()}
      </>
    );
  }

  return (
    <>
      <label htmlFor={fieldKey} className={styles.form_label}>
        {field.label}
        {field.required && <span className={styles.required_asterisk}>*</span>}
      </label>
      {renderField()}
    </>
  );
}

export default FormField;
