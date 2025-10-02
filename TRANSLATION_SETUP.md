# Translation Feature Setup Guide

## Overview

The application now supports multi-language form translation using OpenAI's GPT API. Forms can be dynamically translated between English and Spanish with automatic caching to prevent abuse and reduce API costs.

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure OpenAI API Key

Create an `api_key.txt` file in the `backend` directory with your OpenAI API key:

```bash
cd backend
echo "your-openai-api-key-here" > api_key.txt
```

**Note**: This file is gitignored and will not be committed to your repository.

### 3. Database Migration

The `TranslatedForm` model will be automatically created when you restart the backend server. The SQLModel ORM handles schema migrations automatically on startup.

## How It Works

### Backend Architecture

1. **TranslationService** (`translation_service.py`):

   - Handles OpenAI API integration
   - Translates form fields (labels, placeholders, options)
   - Uses GPT-4o-mini for cost-effective, accurate medical translations

2. **TranslatedForm Model** (`models.py`):

   - Stores cached translations in the database
   - Indexed by `form_id` and `language_code` for fast lookups

3. **API Endpoints** (`main.py`):
   - `POST /api/forms`: Creates forms and pre-caches Spanish translation
   - `GET /api/forms/latest?lang={code}`: Returns form in specified language

### Translation Caching Strategy

- **When a form is created**: Spanish translation is immediately cached
- **When a form is requested**:
  1. Check cache first
  2. If not cached, translate and store
  3. If translation fails, return English version

This approach prevents API abuse and ensures fast response times.

### Frontend Architecture

1. **LanguageContext** (`contexts/LanguageContext.jsx`):

   - Global state management for language preference
   - Shared across all components

2. **Header Component**:

   - Language dropdown (English/Spanish)
   - Changes apply immediately to active forms

3. **UserFormPage**:
   - Automatically refetches form when language changes
   - Seamless user experience with loading states

## Supported Languages

Currently supported:

- English (`en`)
- Spanish (`es`)

## Cost Considerations

- **Model**: GPT-4o-mini (cost-effective)
- **Caching**: Translations are cached indefinitely
- **Pre-caching**: Spanish translations are generated when forms are created
- **Typical cost**: ~$0.01 per form translation

## Error Handling

The system gracefully handles translation failures:

- If OpenAI API is unavailable, returns English version
- If API key is missing or invalid, logs warning and returns English version
- Network errors fallback to cached or English versions

## API Key Storage

For simplicity, the API key is stored in `backend/api_key.txt`:

- File is automatically gitignored (safe from version control)
- Simple text file - no environment variable setup needed
- Loaded directly by the TranslationService class
- Perfect for demo and development purposes

## Testing

To test the translation feature:

1. Add your OpenAI API key to `backend/api_key.txt`
2. Start the backend server
3. Create a form in the admin interface
4. Navigate to the user form page
5. Use the language dropdown in the header to switch between English and Spanish
6. Verify that form fields update accordingly

## Future Enhancements

Potential improvements:

- Add more languages (French, German, Chinese, etc.)
- User preference storage in database
- Browser language auto-detection
- Translation quality feedback mechanism
