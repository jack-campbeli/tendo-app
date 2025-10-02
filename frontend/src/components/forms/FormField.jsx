import React from 'react';
import styles from './FormField.module.css';

function FormField({ field, index, formData, handleInputChange }) {

  // create a unique key for each field instance
  const fieldKey = `${field.id}_${index}`;

  const renderField = () => {
    // The `switch` statement is a clean way to handle multiple possible cases for `field.type`.
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
      case 'tel':
        // For simple input types, we render an `<input>` tag.
        return (
          <input
            type={field.type}
            id={fieldKey} // The `id` is used to link the `<label>` to the input for accessibility.
            className={styles.form_input}
            // This is a "controlled component". The input's value is directly controlled by React state (`formData`).
            value={formData[fieldKey] || ''} // or conditional ensures a default value
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
            rows={4} // initial visible height of the textarea
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
            {/* default, disabled option */}
            <option value="">Select an option</option>
            
            {/* CONDITIONAL RENDERING: render field options for each option */}
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      // CONTINUE HERE (REVIEW)!!!

      case 'radio':
        return (
          <div className={styles.radio_group}>
            {field.options?.map((option, optionIndex) => (
              <div key={`${fieldKey}_${optionIndex}`} className={styles.radio_option}>
                <input
                  type="radio"
                  id={`${fieldKey}_option_${optionIndex}`}
                  // All radio buttons in a group must have the same `name` attribute.
                  // This is what allows the user to only select one at a time.
                  name={fieldKey}
                  value={option}
                  // A radio button is checked if its `value` matches the value in our state for this field.
                  checked={formData[fieldKey] === option}
                  onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                  required={field.required}
                />
                <label htmlFor={`${fieldKey}_option_${optionIndex}`}>{option}</label>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        // Note: This component handles a group of checkboxes, where each checkbox represents one of the `options`.
        // A single, standalone checkbox would have a simpler implementation.
        return (
          <div className={styles.checkbox_group}>
            {field.options?.map((option, optionIndex) => (
              <div key={`${fieldKey}_${optionIndex}`} className={styles.checkbox_option}>
                <input
                  type="checkbox"
                  id={`${fieldKey}_option_${optionIndex}`}
                  value={option}
                  // For a group of checkboxes, we store the selected values in an array in our state.
                  // A checkbox is checked if its `value` is included in that array.
                  checked={Array.isArray(formData[fieldKey]) && formData[fieldKey].includes(option)}
                  onChange={(e) => {
                    // Because multiple checkboxes can be selected, the logic is more complex.
                    // We first get the current array of selected values from state.
                    const currentValues = Array.isArray(formData[fieldKey]) ? formData[fieldKey] : [];
                    if (e.target.checked) {
                      // If the box was just checked, we add the new value to the array.
                      handleInputChange(fieldKey, [...currentValues, option]);
                    } else {
                      // If the box was just unchecked, we remove the value from the array.
                      handleInputChange(fieldKey, currentValues.filter(v => v !== option));
                    }
                  }}
                />
                <label htmlFor={`${fieldKey}_option_${optionIndex}`}>{option}</label>
              </div>
            ))}
          </div>
        );

      default:
        // A fallback case in case `field.type` is something unexpected.
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

  // For radio buttons and checkboxes, the main label for the group is handled outside the `renderField` function,
  // as the function itself renders multiple labels for each individual option.
  if (field.type === 'radio' || field.type === 'checkbox') {
    return (
      <>
        {/* React Fragments (`<>...</>`) let us group multiple elements without adding an extra div to the DOM. */}
        <label className={styles.form_label}>
          {field.label}
          {field.required && <span className={styles.required_asterisk}>*</span>}
        </label>
        {renderField()}
      </>
    );
  }

  // For all other field types, we render the label and then the field itself.
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
