# Tendo API Documentation

This directory contains comprehensive API documentation for the Tendo Form Management application.

## 📚 Contents

- **`api-spec.yaml`** - OpenAPI 3.0.3 specification defining all API endpoints
- **`swagger-ui.html`** - Interactive Swagger UI documentation viewer
- **`README.md`** - This file

## 🚀 Quick Start

### View Documentation Locally

1. **Using Python HTTP Server** (recommended):

   ```bash
   cd docs
   python -m http.server 8080
   ```

   Then open: http://localhost:8080/swagger-ui.html

2. **Using Node.js HTTP Server**:

   ```bash
   cd docs
   npx http-server -p 8080
   ```

   Then open: http://localhost:8080/swagger-ui.html

3. **Using Live Server** (VS Code extension):
   - Install the "Live Server" extension
   - Right-click on `swagger-ui.html`
   - Select "Open with Live Server"

### Online Swagger Editor

You can also view and edit the specification online:

1. Go to https://editor.swagger.io/
2. Copy and paste the contents of `api-spec.yaml`

## 📖 API Overview

### Base URL

- **Development**: `http://localhost:8000`

### Available Endpoints

#### 🗂️ Forms

- `POST /api/forms` - Create a new form
- `GET /api/forms/latest` - Get the most recent form (with translation support)
- `GET /api/forms/{form_id}` - Get a specific form by ID
- `GET /api/forms` - Get all forms (debug endpoint)

#### 📝 Submissions

- `POST /api/submissions` - Submit a completed form
- `GET /api/submissions` - Get all form submissions

#### 🔐 Authentication

- `POST /api/auth/login` - User login (returns JWT or session)

#### 👤 Users

- `GET /api/users/{email}` - Get user information by email

#### ❤️ Health

- `GET /api/test` - API health check

## 🌍 Multi-Language Support

The API includes built-in translation capabilities:

- Forms can be retrieved in multiple languages using the `lang` query parameter
- Supported languages: English (en), Spanish (es), French (fr), German (de), Italian (it), Portuguese (pt), Chinese (zh), Japanese (ja), Korean (ko), Arabic (ar)
- Translations are automatically cached for improved performance
- Form submissions in non-English languages are automatically translated to English for storage

**Example**:

```
GET /api/forms/latest?lang=es
```

## 🔑 Authentication

The API uses email and password-based authentication. There are two user types:

- **Patient**: Regular users who submit forms
- **Admin**: Administrators who create and manage forms

### Default Test Users

Development environment includes two test accounts:

**Patient User:**

- Email: jack@gmail.com
- Password: 1111

**Admin User:**

- Email: maggie@gmail.com
- Password: 1234

> ⚠️ **Security Note**: In production, passwords should be hashed and proper JWT/OAuth2 authentication should be implemented.

## 📊 Data Models

### Form Field Types

- `text` - Single-line text input
- `email` - Email address input
- `tel` - Phone number input
- `date` - Date picker
- `number` - Numeric input
- `textarea` - Multi-line text input
- `select` - Dropdown selection
- `checkbox` - Checkbox input
- `radio` - Radio button selection

### User Types

- `patient` - Regular user with medical information
- `admin` - Administrator with form management privileges

## 🔧 Technical Details

### Technology Stack

- **Framework**: FastAPI
- **Database**: SQLite with SQLModel ORM
- **Translation**: OpenAI API
- **CORS**: Enabled for all origins (update for production)

### Database Schema

- **Forms**: Stores form definitions
- **FormSubmissions**: Stores user submissions
- **TranslatedForms**: Caches translated forms
- **Users**: Stores user accounts (patient and admin)

## 📝 Example Usage

### Creating a Form

```bash
curl -X POST http://localhost:8000/api/forms \
  -H "Content-Type: application/json" \
  -d '{
    "form_name": "Patient Intake Form",
    "fields": [
      {
        "id": "field_1",
        "label": "Full Name",
        "type": "text",
        "required": true,
        "placeholder": "Enter your full name"
      },
      {
        "id": "field_2",
        "label": "Date of Birth",
        "type": "date",
        "required": true
      }
    ]
  }'
```

### Getting Latest Form (Spanish)

```bash
curl http://localhost:8000/api/forms/latest?lang=es
```

### Submitting a Form

```bash
curl -X POST http://localhost:8000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "form_id": "123e4567-e89b-12d3-a456-426614174000",
    "submission_data": {
      "field_1": "John Doe",
      "field_2": "1990-05-15"
    },
    "language": "en"
  }'
```

### User Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jack@gmail.com",
    "password": "1111"
  }'
```

## 🛠️ Development Notes

- The API automatically creates database tables on startup
- Dummy users are initialized on first run
- All timestamps are stored in UTC
- Form fields and submission data are stored as JSON strings
- Translation caching significantly improves performance for repeated requests

## 📞 Support

For questions or issues with the API, please contact the Tendo Development Team.

---

**Last Updated**: October 3, 2025  
**API Version**: 1.0.0  
**OpenAPI Version**: 3.0.3
