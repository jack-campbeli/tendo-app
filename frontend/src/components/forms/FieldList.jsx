import React from 'react';
import styles from './FieldList.module.css';

function FieldList({
  fields,
  fieldTypes,
  onMoveUp,
  onMoveDown,
  onRemove
}) {
  
  // if no fields, render nothing
  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="form-section">
      {/* CONDITIONAL RENDERING: number of fields in title */}
      <h3 className="section-title">3. Current Form Fields ({fields.length} {fields.length === 1 ? 'field' : 'fields'})</h3>

      {/* iterate over fields and render a div for each */}
      {fields.map((field, index) => (
        // pass key prop to ensure field specific re-rendering
        <div key={field.id} className={styles.field_item}>
          <div className={styles.field_info}>
            <strong className={styles.field_label}>{field.label}</strong>
            
            {/* REVIEW OPTIONAL CHAINING: im confused */}
            <span className={styles.field_type}>
              {fieldTypes.find(t => t.value === field.type)?.label || field.type}
            </span>
            
            {/* CONDITIONAL RENDERING: only render if field is required */}
            {field.required && <span className={styles.field_required}>Required</span>}
            
            {/* CONDITIONAL RENDERING: only show options div if field has options */}
            {field.options && field.options.length > 0 && (
              <div className={styles.field_options}>
                <strong>Options:</strong> {field.options.join(', ')}
              </div>
            )}
          </div>

          {/* This section contains the buttons to move or remove the field. */}
          <div className={styles.field_controls}>
            <button
              onClick={() => onMoveUp(index)}
              disabled={index === 0} // disabled if at top
              className={styles.btn_move}
            >↑</button>

            <button
              onClick={() => onMoveDown(index)}
              disabled={index === fields.length - 1} // disabled if at bottom
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
