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
    required: false, // Whether this field is mandatory
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
  
  // HOW ADDING FIELDS WORKS:
  // 1. User fills out currentField (label, type, required)
  // 2. Clicks "Add Field" which triggers this function
  // 3. We validate the input and add it to the fields array
  const handleAddField = () => {
    // Validation: make sure they entered a label
    if (!currentField.label.trim()) {
      setError('Field label is required');
      return;
    }

    // New validation for options
    if (typesWithOptions.includes(currentField.type) && !currentField.options.trim()) {
      setError('Options are required for select, checkbox, or radio field types.');
      return;
    }

    // Create a new field object with a unique ID
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
        .filter(Boolean);

      if (options.length < 1) { // Also checking for at least one valid option
        setError('Please provide at least one valid option.');
        return;
      }
      newField.options = options;
    }

    // Add the new field to our fields array using the spread operator
    // This creates a new array with all existing fields plus the new one
    setFields([...fields, newField]);
    
    // Reset the form for the next field
    setCurrentField({ label: '', type: 'text', required: false, options: '' });
    setError(null);
  };

  // HOW REMOVING FIELDS WORKS:
  // We filter out the field with the matching ID
  const handleRemoveField = (fieldId) => {
    setFields(fields.filter(field => field.id !== fieldId));
  };

  // HOW MOVING FIELDS UP/DOWN WORKS:
  // We swap the positions of two adjacent fields in the array
  
  const handleMoveFieldUp = (index) => {
    // Can't move the first item up
    if (index === 0) return;
    
    // Create a copy of the fields array
    const newFields = [...fields];
    
    // Swap the current field with the one above it
    // This uses array destructuring to swap two elements
    [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
    
    // Update the state with the new order
    setFields(newFields);
  };

  const handleMoveFieldDown = (index) => {
    // Can't move the last item down
    if (index === fields.length - 1) return;
    
    const newFields = [...fields];
    // Swap the current field with the one below it
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    setFields(newFields);
  };

  // ========== API COMMUNICATION ==========
  
  // HOW SAVING FORMS WORKS:
  // 1. Validate that we have a form name and at least one field
  // 2. Format the data the way our API expects it
  // 3. Send a POST request to the backend
  // 4. Handle the response (success or error)
  const handleSaveForm = async () => {
    // Validation checks
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
        // The spread operator (...field) copies all properties except 'id'
        fields: fields.map(({ id, ...field }) => field)
      };

      // Send the data to our backend API
      const response = await fetch('http://localhost:8000/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Tell the server we're sending JSON
        },
        body: JSON.stringify(formData) // Convert our JS object to JSON string
      });

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse the JSON response
      const result = await response.json();
      
      // Store the form ID that the API returned
      setSavedFormId(result.form_id);
      
      // Reset the form so they can create another one
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

  // Reset to create a new form after successfully saving one
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
          onCreateAnother={handleStartNewForm}
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
