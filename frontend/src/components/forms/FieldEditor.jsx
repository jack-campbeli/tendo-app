import React from 'react';
import styles from './FieldEditor.module.css';

function FieldEditor({
  currentField,
  setCurrentField,
  fieldTypes,
  typesWithOptions,
  onAddField
}) {
  return (
    <div className="form-section">
      <h3 className="section-title">2. Add Fields</h3>

      <div className={styles.field_grid}>
        {/* Field Label Input */}
        <div>
          <label className="form-label">Field Label:</label>
          <input
            type="text"
            // controlled by currentField state from parent (AdminPage)
            value={currentField.label} 
            onChange={(e) => setCurrentField({ ...currentField, label: e.target.value })}
            placeholder="Enter field label (e.g., Date of Birth)"
            className="form-input"
          />
        </div>

        {/* Field Type Dropdown */}
        <div>
          <label className="form-label">Field Type:</label>
          {/* A `<select>` element creates a dropdown list. */}
          <select
            value={currentField.type}
            onChange={(e) => setCurrentField({ ...currentField, type: e.target.value })}
            className="form-input"
          >
            {/* for each type in fieldTypes, render an option */}
            {fieldTypes.map(type => (
              // key prop included for efficient rendering
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CONDITIONAL RENDERING: if the current field type is in typesWithOptions*/}
      {typesWithOptions.includes(currentField.type) && (
        <div className={styles.options_container}>
          <label className="form-label">Options (comma-separated):</label>
          <input
            type="text"
            value={currentField.options}
            onChange={(e) => setCurrentField({ ...currentField, options: e.target.value })}
            placeholder="e.g., Option 1, Option 2, Option 3"
            className="form-input"
          />
        </div>
      )}

      {/* Required Checkbox */}
      <div className={styles.checkbox_container}>
        <label className={styles.checkbox_label}>
          <input
            type="checkbox"
            // for a checkbox, its state (checked or not) is stored in the `checked` attribute, not `value`.
            checked={currentField.required}
            // The value we get from the `onChange` event for a checkbox is `e.target.checked`, which is a boolean (true or false).
            onChange={(e) => setCurrentField({ ...currentField, required: e.target.checked })}
            className={styles.checkbox_input}
          />
          <span className={styles.checkbox_text}>Required field</span>
        </label>
      </div>

      {/* add field button */}
      <button onClick={onAddField} className="btn btn-success">
        ➕ Add Field
      </button>
    </div>
  );
}

export default FieldEditor;
