import React from 'react';
import styles from './FieldList.module.css';

function FieldList({
  fields,
  fieldTypes,
  onMoveUp,
  onMoveDown,
  onRemove
}) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="form-section">
      <h3 className="section-title">3. Current Form Fields ({fields.length} {fields.length === 1 ? 'field' : 'fields'})</h3>

      {/* ARRAY MAPPING: This loops over the `fields` array. For each `field` object in the
          array, it creates a `<div>` element to display its information and controls. */}
      {fields.map((field, index) => (
        // The `key` prop is crucial for lists. It helps React identify which items have
        // changed, been added, or been removed, improving performance and preventing bugs.
        // We use `field.id` because it's a unique identifier for each field.
        <div key={field.id} className={styles.field_item}>
          <div className={styles.field_info}>
            <strong className={styles.field_label}>{field.label}</strong>
            {/* Display the user-friendly label for the field type */}
            <span className={styles.field_type}>
              {fieldTypes.find(t => t.value === field.type)?.label || field.type}
            </span>
            {/* SHORT-CIRCUIT RENDERING: The "Required" span is only rendered if `field.required` is true. */}
            {field.required && <span className={styles.field_required}>Required</span>}
            {/* Displaying field options if they exist */}
            {field.options && field.options.length > 0 && (
              <div className={styles.field_options}>
                <strong>Options:</strong> {field.options.join(', ')}
              </div>
            )}
          </div>

          {/* FIELD CONTROLS */}
          <div className={styles.field_controls}>
            {/* The `disabled` attribute is set based on a condition. The button is disabled
                if the field is already at the very top of the list. */}
            <button
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className={styles.btn_move}
            >↑</button>

            {/* This button is disabled if the field is at the very bottom of the list. */}
            <button
              onClick={() => onMoveDown(index)}
              disabled={index === fields.length - 1}
              className={styles.btn_move}
            >↓</button>

            {/* Remove Button */}
            <button
              onClick={() => onRemove(field.id)}
              className={styles.btn_remove}
            >🗑️ Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FieldList;
