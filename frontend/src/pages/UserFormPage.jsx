import React, { useState, useEffect } from 'react';
import './UserFormPage.css';
import FormField from '../components/forms/FormField';
import Header from '../components/common/Header';
import { useLanguage } from '../contexts/LanguageContext';

// Local translations for UI elements
const UI_TRANSLATIONS = {
  en: {
    submitButton: 'Submit Form',
    fillAnother: 'Fill Another Response',
    successTitle: 'Form Submitted Successfully',
    successMessage: 'Thank you for your response. Your submission has been recorded.',
    loadingForm: 'Loading Form...',
    errorLoading: 'Error Loading Form',
    noFormsAvailable: 'No Forms Available',
    noFormsMessage: 'There are currently no forms available for you to fill out.',
    noFormsContact: 'Please check back later or contact the administrator.'
  },
  es: {
    submitButton: 'Enviar Formulario',
    fillAnother: 'Completar Otra Respuesta',
    successTitle: 'Formulario Enviado Exitosamente',
    successMessage: 'Gracias por su respuesta. Su envío ha sido registrado.',
    loadingForm: 'Cargando Formulario...',
    errorLoading: 'Error al Cargar Formulario',
    noFormsAvailable: 'No Hay Formularios Disponibles',
    noFormsMessage: 'Actualmente no hay formularios disponibles para completar.',
    noFormsContact: 'Por favor, vuelva más tarde o contacte al administrador.'
  }
};

function UserFormPage() {
  const { language } = useLanguage();
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // fetch the latest form on page load or when language changes
  useEffect(() => {
    const fetchLatestForm = async () => {
      try {
        setLoading(true);

        // get the latest form with language parameter
        const response = await fetch(`http://localhost:8000/api/forms/latest?lang=${language}`);
        
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
  }, [language]); // Re-fetch when language changes

  // replaces the form data with the new value while keeping the existing data
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
            <h1>{t.loadingForm}</h1>
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
            <h1>{t.errorLoading}</h1>
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
            <h1>{t.noFormsAvailable}</h1>
            <p>{t.noFormsMessage}</p>
            <p>{t.noFormsContact}</p>
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
          <div className="submission-success">

            {/* SVG checkmark icon */}
            <div className="submission-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Success title and message */}
            <h1 className="submission-title">{t.successTitle}</h1>
            <p className="submission-message">
              {t.successMessage}
            </p>

            {/* Fill another response button */}
            <button
              type="button"
              className="submit-button"
              onClick={() => {
                resetFormInputs();
                setSubmitted(false); // Reset state to show form again
              }}
            >
              {t.fillAnother}
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
            {t.submitButton}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}

export default UserFormPage;
