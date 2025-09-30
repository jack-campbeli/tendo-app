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
            value={currentField.label}
            onChange={(e) => setCurrentField({ ...currentField, label: e.target.value })}
            placeholder="Enter field label (e.g., Date of Birth)"
            className="form-input"
          />
        </div>

        {/* Field Type Dropdown */}
        <div>
          <label className="form-label">Field Type:</label>
          <select
            value={currentField.type}
            onChange={(e) => setCurrentField({ ...currentField, type: e.target.value })}
            className="form-input"
          >
            {/* Loop through the `fieldTypes` array to create an `<option>` for each type. */}
            {fieldTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Options Input - shown only for select, checkbox, radio */}
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
            checked={currentField.required}
            // For checkboxes, we use `e.target.checked` (true/false) instead of `e.target.value`.
            onChange={(e) => setCurrentField({ ...currentField, required: e.target.checked })}
            className={styles.checkbox_input}
          />
          <span className={styles.checkbox_text}>Required field</span>
        </label>
      </div>

      <button onClick={onAddField} className="btn btn-success">
        ➕ Add Field
      </button>
    </div>
  );
}

export default FieldEditor;
