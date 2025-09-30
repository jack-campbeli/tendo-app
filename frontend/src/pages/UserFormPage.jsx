import React, { useState, useEffect } from 'react';
import './UserFormPage.css';
import FormField from '../components/forms/FormField';
import Header from '../components/common/Header';

function UserFormPage() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // fetch the latest form on page load
  useEffect(() => {
    const fetchLatestForm = async () => {
      try {
        setLoading(true);

        // get the latest form (fetch() defaults to GET)
        const response = await fetch('http://localhost:8000/api/forms/latest');
        
        if (!response.ok) {
          if (response.status === 404) {
            // No forms available - this is expected behavior, not an error
            setForm(null);
            setError(null);
            return;
          }
          throw new Error('Failed to fetch form');
        }
        
        // convert JSON to JS object and set the form state
        const formData = await response.json();
        setForm(formData);
        
        // initialize form data with empty values using our helper function
        const initialData = initializeFormData(formData.fields);
        setFormData(initialData);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestForm();
  }, []); // Empty dependency array [] = runs only once on mount

  // replaces the form data with the new value while keeping the existing data
  /**
   * Helper function to initialize form data with empty values
   * This follows the DRY principle - we use it in multiple places!
   */
  const initializeFormData = (fields) => {
    const initialData = {};
    fields.forEach((field, index) => {
      const fieldKey = `${field.id}_${index}`;
      if (field.type === 'checkbox') {
        initialData[fieldKey] = []; // Checkboxes need arrays for multiple selections
      } else {
        initialData[fieldKey] = ''; // All other fields start empty
      }
    });
    return initialData;
  };

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev, // Spread operator: keeps existing data
      [fieldId]: value // Computed property: uses fieldId as key
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionPayload = {
        form_id: form.id,
        submission_data: formData,
      };

      const response = await fetch('http://localhost:8000/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionPayload), // JS obj -> JSON str
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      console.log('Form submitted successfully:', formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const resetFormInputs = () => {
    if (!form?.fields) return; // Optional chaining: safe if form is null
    const initialData = initializeFormData(form.fields);
    setFormData(initialData);
  };

  // Early returns: React pattern to show different UI based on state
  if (loading) {
    return (
      <>
        <Header title="Patient Form" />
        <div className="user-form-container">
          <div className="loading-container">
            <h1>Loading Form...</h1>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Patient Form" />
        <div className="user-form-container">
          <div className="error-container">
            <h1>Error Loading Form</h1>
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  if (!form) {
    return (
      <>
        <Header title="Patient Form" />
        <div className="user-form-container">
          <div className="no-form-container">
            <h1>No Forms Available</h1>
            <p>There are currently no forms available for you to fill out.</p>
            <p>Please check back later or contact the administrator.</p>
          </div>
        </div>
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <Header title="Patient Form" />
        <div className="user-form-container">
          <div className="user-form-content">
            <h1 className="user-form-title">Form Submitted</h1>
            <p className="submission-confirmation">Thank you for your response. Your submission has been recorded.</p>
            <button
              type="button"
              className="submit-button"
              onClick={() => {
                resetFormInputs();
                setSubmitted(false); // Reset state to show form again
              }}
            >
              Fill Another Response
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Patient Form" />
      <div className="user-form-container">
        <div className="user-form-content">
          <h1 className="user-form-title">{form.form_name}</h1>
        
        <form onSubmit={handleSubmit} className="user-form">
          {form.fields.map((field, index) => (
              <div key={`field_${field.id}_${index}`} className="form-field"> {/* key prop helps React track changes */}
                
                <FormField
                  field={field}
                  index={index}
                  formData={formData}
                  handleInputChange={handleInputChange}
                />

              </div>
            ))}
          
          <button 
            type="submit" 
            className="submit-button"
          >
            Submit Form
          </button>
        </form>
      </div>
    </div>
    </>
  );
}

export default UserFormPage;
