import React, { useState } from 'react';
import './AdminPage.css';
import FieldEditor from '../components/forms/FieldEditor';
import FieldList from '../components/forms/FieldList';
import Header from '../components/common/Header';
import SuccessMessage from '../components/common/SuccessMessage';

function AdminPage() {

  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState([]);
  
  const [currentField, setCurrentField] = useState({
    label: '',      // What the user will see (e.g. "Date of Birth")
    type: 'text',   // What kind of input (text, email, date, etc.)
    required: false, 
    options: '', // For comma-separated options for select, checkbox, radio
  });
  
  const [savedFormId, setSavedFormId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const typesWithOptions = ['select', 'checkbox', 'radio'];

  // ========== AVAILABLE FIELD TYPES ==========
  // This defines what types of form fields admins can create
  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'date', label: 'Date' },
    { value: 'tel', label: 'Phone' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Button' }
  ];

  // ========== FIELD MANAGEMENT FUNCTIONS ==========
  
  // ========== Handle Field Adding ==========
  // 1. User fills out currentField (label, type, required)
  // 2. Clicks "Add Field" which triggers this function
  // 3. We validate the input and add it to the fields array
  const handleAddField = () => {
    
    // ensure label is not empty
    if (!currentField.label.trim()) {
      setError('Field label is required');
      return;
    }

    // ensure options are not empty for types with options (select, checkbox, radio)
    if (typesWithOptions.includes(currentField.type) && !currentField.options.trim()) {
      setError('Options are required for select, checkbox, or radio field types.');
      return;
    }

    // create new field object from 'currentField' with unique ID
    const newField = {
      id: Date.now(), // Simple way to create unique IDs (timestamp)
      label: currentField.label.trim(), // Remove extra spaces
      type: currentField.type,
      required: currentField.required,
    };

    // If the field type needs options, parse them from the string
    if (typesWithOptions.includes(newField.type)) {
      const options = currentField.options
        .split(',')
        .map(opt => opt.trim())
        .filter(Boolean); // removes fasly values

      // ensure at least one valid option
      if (options.length < 1) {
        setError('Please provide at least one valid option.');
        return;
      }
      newField.options = options;
    }

    // add new field to fields array and reset current field 
    setFields([...fields, newField]);
    setCurrentField({ label: '', type: 'text', required: false, options: '' });
    setError(null);
  };

  // ========== Handle Field Removal ==========
  const handleRemoveField = (fieldId) => {
    setFields(fields.filter(field => field.id !== fieldId));
  };


  // ========== Handle Field Moving ==========
  const handleMoveFieldUp = (index) => {
    // if already at top, return
    if (index === 0) return;
    
    const newFields = [...fields];    
    // Swap the current field with the one above it
    // This uses array destructuring to swap two elements
    [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
    setFields(newFields);
  };

  const handleMoveFieldDown = (index) => {
    // if already at bottom, return
    if (index === fields.length - 1) return;
    
    const newFields = [...fields];
    // Swap the current field with the one below it
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    setFields(newFields);
  };

  // ========== Handle Form Saving ==========
  const handleSaveForm = async () => {
    
    // Validate that we have a form name and at least one field
    if (!formName.trim()) {
      setError('Form name is required');
      return;
    }
    if (fields.length === 0) {
      setError('At least one field is required');
      return;
    }

    // Show loading state
    setIsLoading(true);
    setError(null);

    try {
      // Format the data for the API
      const formData = {
        form_name: formName.trim(),
        // Remove the temporary 'id' field since the API doesn't need it
        fields: fields.map(({ id, ...field }) => field)
      };

      // Send the data to our backend API
      const response = await fetch('http://localhost:8000/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData) // Convert our JS object to JSON string
      });

      // if not successful, throw error
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // parse JSON response
      const result = await response.json();
      
      // store the form ID that the API returned
      setSavedFormId(result.form_id);
      
      // reset the form
      setFormName('');
      setFields([]);
      setCurrentField({ label: '', type: 'text', required: false, options: '' });
      
    } catch (err) {
      // If anything went wrong, show the error
      setError(`Failed to save form: ${err.message}`);
    } finally {
      // Always turn off the loading state
      setIsLoading(false);
    }
  };

  // ========== Handle Form Starting ==========
  // reset to create a new form after successfully saving one
  const handleStartNewForm = () => {
    setSavedFormId(null);
    setError(null);
  };

  // ========== RENDER THE USER INTERFACE ==========
  // The return statement contains all the JSX (HTML-like code) that defines what the component looks like.
  return (
    <>
      <Header title="Admin Dashboard" />
      {/* The main container for the entire page. */}
      <div className="admin-container">
        <h1 className="admin-title">
          Form Builder
        </h1>
        <p className="admin-subtitle">
          Create beautiful, dynamic forms in minutes
        </p>
      
      {/* TERNARY OPERATOR FOR CONDITIONAL RENDERING:
          - If `savedFormId` has a value (is "truthy"), it renders the success message.
          - Otherwise (`:`), it renders the form builder interface. */}
      {savedFormId ? (
        // SUCCESS STATE: This block is shown only after a form is successfully saved.
        <SuccessMessage 
          formId={savedFormId}
          onStartNewForm={handleStartNewForm}
        />
      ) : (
        // FORM BUILDER STATE: If no form has been saved yet, show the main interface.
        // `<>` is a React Fragment. It lets us group elements without adding an extra `<div>` to the HTML.
        <>
          {/* 1. FORM NAME INPUT */}
          <div className="form-section">
            <h3 className="section-title">1. Form Name</h3>
            {/* This is a "controlled component". Its value is controlled by React state (`formName`).
                - `value={formName}`: The input always displays the current state.
                - `onChange`: When the user types, it updates the state, which re-renders the input. */}
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter form name (e.g., Patient Intake)"
              className="form-input"
            />
          </div>

          {/* 2. FIELD CREATION SECTION */}
          <FieldEditor
            currentField={currentField}
            setCurrentField={setCurrentField}
            fieldTypes={fieldTypes}
            typesWithOptions={typesWithOptions}
            onAddField={handleAddField}
          />

          {/* 3. FIELD LIST DISPLAY */}
          <FieldList
            fields={fields}
            fieldTypes={fieldTypes}
            onMoveUp={handleMoveFieldUp}
            onMoveDown={handleMoveFieldDown}
            onRemove={handleRemoveField}
          />

          {/* ERROR DISPLAY */}
          {/* This error message div is only rendered if the `error` state has a value. */}
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* 4. SAVE FORM BUTTON */}
          <div className="text-center">
            <button
              onClick={handleSaveForm}
              disabled={isLoading}
              className="btn btn-save"
            >
              {/* The button text changes based on the `isLoading` state. */}
              {isLoading ? '⏳ Saving...' : '💾 Save Form'}
            </button>
          </div>
        </>
      )}
      </div>
    </>
  );
}

export default AdminPage;
