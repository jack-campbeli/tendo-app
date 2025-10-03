# Visual Diagrams

This document contains all visual diagrams for the Tendo application in easy-to-read ASCII format.

## Table of Contents

1. [Database Schema / Entity Relationship Diagram](#database-schema--entity-relationship-diagram)
2. [System Architecture Diagram](#system-architecture-diagram)
3. [Component Structure](#component-structure)
4. [Sequence Diagrams](#sequence-diagrams)

---

## Database Schema / Entity Relationship Diagram

### Current Implementation (Simplified Schema with JSON Storage)

```
┌─────────────────────────────────────────────────────────────┐
│                          User                                │
│                         [TABLE]                              │
├──────────────────────────────────────────────────────────────┤
│ 🔑 id: INTEGER PRIMARY KEY AUTOINCREMENT                    │
│ ⚡ email: TEXT UNIQUE NOT NULL (indexed)                    │
│    password: TEXT NOT NULL                                   │
│    user_type: TEXT NOT NULL  ("patient" | "admin")          │
│    first_name: TEXT NOT NULL                                 │
│    last_name: TEXT NOT NULL                                  │
│    created_at: DATETIME NOT NULL                             │
│                                                              │
│    # Patient-specific fields (NULL for admin users)         │
│    recent_diagnosis: TEXT NULL                               │
│    primary_care_physician: TEXT NULL                         │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ 1 admin creates many forms
                              │ (logical relationship, not FK)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                          Form                                │
│                         [TABLE]                              │
├──────────────────────────────────────────────────────────────┤
│ 🔑 id: TEXT PRIMARY KEY (UUID)                              │
│    form_name: TEXT NOT NULL                                  │
│    fields: TEXT NOT NULL  (JSON Array)                       │
│    created_at: DATETIME NOT NULL                             │
│                                                              │
│    Example fields JSON:                                      │
│    [{                                                        │
│      "id": "field_1",                                        │
│      "label": "Patient Name",                                │
│      "type": "text",                                         │
│      "required": true,                                       │
│      "placeholder": "Enter full name",                       │
│      "options": []                                           │
│    }, ...]                                                   │
└──────────────────────────────────────────────────────────────┘
           │                                    │
           │ 1:N                                │ 1:N
           │                                    │
           ▼                                    ▼
┌───────────────────────────┐      ┌──────────────────────────────┐
│     TranslatedForm        │      │      FormSubmission          │
│        [TABLE]            │      │         [TABLE]              │
├───────────────────────────┤      ├──────────────────────────────┤
│ 🔑 id: INTEGER PK         │      │ 🔑 id: INTEGER PK            │
│ ⚡ form_id: TEXT (indexed)│      │    form_id: TEXT             │
│ ⚡ language_code: TEXT     │      │    submission_data: TEXT     │
│    (indexed)              │      │    (JSON Object)             │
│    translated_form_name:  │      │    submitted_at: DATETIME    │
│    TEXT NOT NULL          │      │                              │
│    translated_fields: TEXT│      │    Example JSON:             │
│    NOT NULL (JSON Array)  │      │    {                         │
│    created_at: DATETIME   │      │      "field_1": "John Doe",  │
│                           │      │      "field_2": "1990-01-15" │
│    Composite Index:       │      │    }                         │
│    (form_id, language_    │      └──────────────────────────────┘
│     code) for fast lookup │
└───────────────────────────┘

Legend:
🔑 = Primary Key
⚡ = Indexed Column
FK = Foreign Key (logical, not enforced in SQLite)
```

### Design Rationale

**Why Single-Table Inheritance for Users?**

- Simpler queries (no JOINs needed)
- Both user types share most fields
- Easy to add new user types
- Faster authentication lookups

**Why JSON Field Storage?**

- Schema flexibility (add field types without migrations)
- Simpler data model (fewer tables)
- Atomic translations (entire form in one query)
- Better for document-style data

**Trade-offs:**

- ❌ Can't query individual field values efficiently
- ❌ Slightly larger storage overhead
- ✅ Much simpler codebase
- ✅ Easier to maintain and extend

---

## System Architecture Diagram

### Full Stack Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                                │
│                            (Port 5173 - Dev)                            │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │                        Web Browser                             │    │
│  │                                                                │    │
│  │  React Single Page Application (SPA)                          │    │
│  │  ├─ React Router (client-side routing)                        │    │
│  │  ├─ Context API (global state)                                │    │
│  │  └─ CSS Modules (component styling)                           │    │
│  └────────────────────────────┬──────────────────────────────────┘    │
│                               │                                        │
│  ┌────────────────────────────▼──────────────────────────────────┐    │
│  │                  Vite Development Server                       │    │
│  │                                                                │    │
│  │  - Hot Module Replacement (HMR)                               │    │
│  │  - Fast ES Module serving                                     │    │
│  │  - Development proxy for API calls                            │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTP/JSON
                                 │ CORS: Allow All (dev only)
                                 │ Base URL: http://localhost:8000
                                 │
┌─────────────────────────────────▼───────────────────────────────────────┐
│                           APPLICATION TIER                              │
│                            (Port 8000)                                  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │                     Uvicorn ASGI Server                        │    │
│  │                                                                │    │
│  │  - Asynchronous request handling                              │    │
│  │  - Auto-reload on code changes (dev)                          │    │
│  │  - Single worker (dev) / Multiple workers (prod)              │    │
│  └────────────────────────────┬──────────────────────────────────┘    │
│                               │                                        │
│  ┌────────────────────────────▼──────────────────────────────────┐    │
│  │                      FastAPI Application                       │    │
│  │                                                                │    │
│  │  ┌─────────────────────────────────────────────────────┐      │    │
│  │  │            Middleware Layer                         │      │    │
│  │  │  - CORS Middleware (allow all origins in dev)       │      │    │
│  │  │  - Request/Response logging                         │      │    │
│  │  └─────────────────────────────────────────────────────┘      │    │
│  │                               │                                │    │
│  │  ┌────────────────────────────▼────────────────────────────┐  │    │
│  │  │                    API Router                           │  │    │
│  │  │                                                         │  │    │
│  │  │  Endpoints:                                            │  │    │
│  │  │  • POST   /api/auth/login                              │  │    │
│  │  │  • POST   /api/forms                                   │  │    │
│  │  │  • GET    /api/forms                                   │  │    │
│  │  │  • GET    /api/forms/latest?lang={code}                │  │    │
│  │  │  • GET    /api/forms/{form_id}                         │  │    │
│  │  │  • POST   /api/submissions                             │  │    │
│  │  │  • GET    /api/submissions                             │  │    │
│  │  │  • GET    /api/users/{email}                           │  │    │
│  │  │  • GET    /api/test                                    │  │    │
│  │  │                                                         │  │    │
│  │  │  Dependencies:                                          │  │    │
│  │  │  └─ get_session() → DB Session                         │  │    │
│  │  └─────────────────────────────────────────────────────────┘  │    │
│  │                               │                                │    │
│  │  ┌────────────────────────────▼────────────────────────────┐  │    │
│  │  │              Business Logic Layer                       │  │    │
│  │  │                                                         │  │    │
│  │  │  ┌─────────────────────────────────────────────┐       │  │    │
│  │  │  │       TranslationService                    │       │  │    │
│  │  │  │   (services/translation_service.py)         │       │  │    │
│  │  │  │                                             │       │  │    │
│  │  │  │  Class Methods:                             │       │  │    │
│  │  │  │  • translate_form_name()                    │       │  │    │
│  │  │  │  • translate_form_fields()                  │       │  │    │
│  │  │  │  • translate_responses_to_english()         │       │  │    │
│  │  │  │                                             │       │  │    │
│  │  │  │  Private Methods:                           │       │  │    │
│  │  │  │  • _load_api_key()                          │       │  │    │
│  │  │  │  • _extract_translatable_content()          │       │  │    │
│  │  │  │  • _translate_batch()                       │       │  │    │
│  │  │  │  • _apply_translations()                    │       │  │    │
│  │  │  │                                             │       │  │    │
│  │  │  │  Configuration:                             │       │  │    │
│  │  │  │  • Model: gpt-4o-mini                       │       │  │    │
│  │  │  │  • Temperature: 0.3 (deterministic)         │       │  │    │
│  │  │  │  • API Key: config/api_key.txt              │       │  │    │
│  │  │  └──────────────────────┬──────────────────────┘       │  │    │
│  │  │                         │                               │  │    │
│  │  │                         │ Async API calls               │  │    │
│  │  │                         │                               │  │    │
│  │  │  ┌──────────────────────▼──────────────────────┐       │  │    │
│  │  │  │      OpenAI API Client (AsyncOpenAI)       │       │  │    │
│  │  │  │                                             │       │  │    │
│  │  │  │  • chat.completions.create()                │       │  │    │
│  │  │  │  • Medical translation prompts              │       │  │    │
│  │  │  │  • JSON response parsing                    │       │  │    │
│  │  │  └─────────────────────────────────────────────┘       │  │    │
│  │  └─────────────────────────────────────────────────────────┘  │    │
│  │                               │                                │    │
│  │  ┌────────────────────────────▼────────────────────────────┐  │    │
│  │  │              Data Access Layer                          │  │    │
│  │  │                                                         │  │    │
│  │  │  ┌──────────────────────────────────────────┐          │  │    │
│  │  │  │        SQLModel ORM                      │          │  │    │
│  │  │  │                                          │          │  │    │
│  │  │  │  Models:                                 │          │  │    │
│  │  │  │  • User (table=True)                    │          │  │    │
│  │  │  │  • Form (table=True)                    │          │  │    │
│  │  │  │  • FormSubmission (table=True)          │          │  │    │
│  │  │  │  • TranslatedForm (table=True)          │          │  │    │
│  │  │  │                                          │          │  │    │
│  │  │  │  Request/Response Models:                │          │  │    │
│  │  │  │  • LoginRequest (BaseModel)             │          │  │    │
│  │  │  │  • LoginResponse (BaseModel)            │          │  │    │
│  │  │  │                                          │          │  │    │
│  │  │  │  Session Management:                     │          │  │    │
│  │  │  │  • Engine (sqlite:///database.db)       │          │  │    │
│  │  │  │  • Session factory                       │          │  │    │
│  │  │  │  • Dependency injection via get_session()          │  │    │
│  │  │  └──────────────────────────────────────────┘          │  │    │
│  │  └─────────────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ SQL Queries
                                 │ (via SQLAlchemy engine)
                                 │
┌─────────────────────────────────▼───────────────────────────────────────┐
│                             DATA TIER                                   │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │                    SQLite Database                             │    │
│  │                    (database.db)                               │    │
│  │                                                                │    │
│  │  Tables:                                                       │    │
│  │  ├─ user                                                       │    │
│  │  │   └─ Index: email (unique)                                 │    │
│  │  ├─ form                                                       │    │
│  │  ├─ formsubmission                                             │    │
│  │  └─ translatedform                                             │    │
│  │      └─ Composite Index: (form_id, language_code)             │    │
│  │                                                                │    │
│  │  Auto-initialization:                                          │    │
│  │  • Tables created via SQLModel.metadata.create_all()          │    │
│  │  • Dummy users seeded on first startup                        │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                               │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │                      OpenAI API                                │    │
│  │                  (api.openai.com)                              │    │
│  │                                                                │    │
│  │  Model: gpt-4o-mini                                           │    │
│  │  Usage: Medical form translation                              │    │
│  │  Cost: ~$0.01 per form translation                            │    │
│  │  Rate Limit: Configured per API key tier                      │    │
│  │                                                                │    │
│  │  Authentication:                                               │    │
│  │  └─ API Key from backend/config/api_key.txt                   │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Structure

### Frontend Component Hierarchy

```
src/
├── main.jsx (Entry point)
│   └── App.jsx (Root component with routing)
│       └── LanguageProvider (Global state)
│           ├── LoginPage
│           │   └── LoginForm
│           │       └── Input (x2 for email/password)
│           │
│           ├── AdminPage (Protected Route)
│           │   ├── Header (with language selector)
│           │   ├── FieldEditor (Form builder)
│           │   │   ├── FormField (Field preview)
│           │   │   └── FieldList
│           │   └── SuccessMessage
│           │
│           └── UserFormPage (Protected Route)
│               ├── Header (with language selector)
│               ├── FormField (x N for each field)
│               └── SuccessMessage
│
├── contexts/
│   └── LanguageContext.jsx
│       - Provides: language, setLanguage
│       - Default: "en"
│       - Consumed by: Header, UserFormPage
│
└── components/
    ├── auth/
    │   ├── LoginForm.jsx (handles authentication)
    │   └── Input.jsx (reusable input with validation)
    │
    ├── common/
    │   ├── Header.jsx (navigation + language selector)
    │   ├── ProtectedRoute.jsx (auth guard)
    │   └── SuccessMessage.jsx (notification)
    │
    └── forms/
        ├── FieldEditor.jsx (form builder UI)
        ├── FieldList.jsx (list of fields in form)
        └── FormField.jsx (dynamic field renderer)
```

### Backend Module Structure

```
backend/
├── main.py (FastAPI app + routes)
│   ├── Lifespan management
│   │   └── _initialize_dummy_users()
│   │
│   ├── Dependency injection
│   │   └── get_session() → Session
│   │
│   └── API Routes
│       ├── POST /api/auth/login
│       ├── POST /api/forms
│       ├── GET  /api/forms
│       ├── GET  /api/forms/latest
│       ├── GET  /api/forms/{form_id}
│       ├── POST /api/submissions
│       ├── GET  /api/submissions
│       ├── GET  /api/users/{email}
│       └── GET  /api/test
│
├── models.py (SQLModel definitions)
│   ├── User (table)
│   ├── Form (table)
│   ├── FormSubmission (table)
│   ├── TranslatedForm (table)
│   ├── LoginRequest (Pydantic)
│   └── LoginResponse (Pydantic)
│
├── services/
│   └── translation_service.py
│       └── TranslationService
│           ├── __init__()
│           ├── translate_form_name()
│           ├── translate_form_fields()
│           ├── translate_responses_to_english()
│           └── private helper methods
│
├── config/
│   ├── __init__.py
│   ├── constants.py
│   │   ├── SUPPORTED_LANGUAGES
│   │   └── PRE_CACHE_LANGUAGES
│   └── api_key.txt (gitignored)
│
└── tests/
    ├── conftest.py (test fixtures)
    ├── test_users.py
    ├── test_forms.py
    ├── test_submissions.py
    └── test_health.py
```

---

## Sequence Diagrams

### 1. User Login Flow

```
User          Browser        FastAPI        Database
 │               │              │              │
 │ Enter creds   │              │              │
 ├──────────────►│              │              │
 │               │ POST /api/   │              │
 │               │ auth/login   │              │
 │               ├─────────────►│              │
 │               │              │ SELECT *     │
 │               │              │ FROM user    │
 │               │              │ WHERE email=?│
 │               │              ├─────────────►│
 │               │              │◄─────────────┤
 │               │              │ User record  │
 │               │              │              │
 │               │              │ Verify pwd   │
 │               │              │              │
 │               │◄─────────────┤              │
 │               │ LoginResponse│              │
 │◄──────────────┤ {user_type,  │              │
 │ Redirect      │  name}       │              │
 │               │              │              │
```

### 2. Form Creation with Pre-Caching

```
Admin    Browser    FastAPI    TranslationSvc   OpenAI      Database
 │          │          │             │             │            │
 │ Create   │          │             │             │            │
 │ form     │          │             │             │            │
 ├─────────►│          │             │             │            │
 │          │ POST /api│             │             │            │
 │          │ /forms   │             │             │            │
 │          ├─────────►│             │             │            │
 │          │          │ Generate    │             │            │
 │          │          │ UUID        │             │            │
 │          │          │             │             │            │
 │          │          │ INSERT form │             │            │
 │          │          ├─────────────────────────────────────────►│
 │          │          │             │             │            │
 │          │          │ Pre-cache   │             │            │
 │          │          │ translations│             │            │
 │          │          │             │             │            │
 │          │          │ For lang    │             │            │
 │          │          │ in [es,fr,  │             │            │
 │          │          │  zh...]     │             │            │
 │          │          │             │             │            │
 │          │          ├────────────►│             │            │
 │          │          │ translate   │ GPT request │            │
 │          │          │ form_name() ├────────────►│            │
 │          │          │             │◄────────────┤            │
 │          │          │             │ Translation │            │
 │          │          │             │             │            │
 │          │          ├────────────►│             │            │
 │          │          │ translate   │ GPT request │            │
 │          │          │ fields()    ├────────────►│            │
 │          │          │             │◄────────────┤            │
 │          │          │             │ Translated  │            │
 │          │          │◄────────────┤ fields      │            │
 │          │          │             │             │            │
 │          │          │ INSERT      │             │            │
 │          │          │ translated  │             │            │
 │          │          │ form        │             │            │
 │          │          ├─────────────────────────────────────────►│
 │          │          │             │             │            │
 │          │          │ (Repeat for each language)               │
 │          │          │             │             │            │
 │          │◄─────────┤             │             │            │
 │◄─────────┤ Success  │             │             │            │
 │          │          │             │             │            │
```

### 3. Form Retrieval with Translation

```
Patient  Browser   FastAPI   TranslationSvc  OpenAI   Database
 │         │          │            │           │         │
 │ Change  │          │            │           │         │
 │ language│          │            │           │         │
 │ to ES   │          │            │           │         │
 ├────────►│          │            │           │         │
 │         │ setState │            │           │         │
 │         │ lang=es  │            │           │         │
 │         │          │            │           │         │
 │         │ GET /api │            │           │         │
 │         │ /forms/  │            │           │         │
 │         │ latest?  │            │           │         │
 │         │ lang=es  │            │           │         │
 │         ├─────────►│            │           │         │
 │         │          │ SELECT *   │           │         │
 │         │          │ FROM form  │           │         │
 │         │          │ ORDER BY   │           │         │
 │         │          │ created_at │           │         │
 │         │          ├─────────────────────────────────►│
 │         │          │◄─────────────────────────────────┤
 │         │          │ Latest form│           │         │
 │         │          │            │           │         │
 │         │          │ SELECT *   │           │         │
 │         │          │ FROM       │           │         │
 │         │          │ translated │           │         │
 │         │          │ form WHERE │           │         │
 │         │          │ form_id=?  │           │         │
 │         │          │ AND lang=? │           │         │
 │         │          ├─────────────────────────────────►│
 │         │          │◄─────────────────────────────────┤
 │         │          │ Cached     │           │         │
 │         │          │ translation│           │         │
 │         │          │            │           │         │
 │         │          │ IF cached: │           │         │
 │         │◄─────────┤ return it  │           │         │
 │◄────────┤ Spanish  │            │           │         │
 │ Display │ form     │            │           │         │
 │         │          │            │           │         │
 │         │          │ IF NOT cached:                   │
 │         │          ├───────────►│           │         │
 │         │          │ translate()│ GPT call  │         │
 │         │          │            ├──────────►│         │
 │         │          │            │◄──────────┤         │
 │         │          │◄───────────┤ Result    │         │
 │         │          │            │           │         │
 │         │          │ INSERT     │           │         │
 │         │          │ cache      │           │         │
 │         │          ├─────────────────────────────────►│
 │         │          │            │           │         │
 │         │◄─────────┤            │           │         │
 │◄────────┤ Spanish  │            │           │         │
 │         │ form     │            │           │         │
```

### 4. Form Submission with Response Translation

```
Patient  Browser   FastAPI   TranslationSvc  OpenAI   Database
 │         │          │            │           │         │
 │ Fill    │          │            │           │         │
 │ form in │          │            │           │         │
 │ Spanish │          │            │           │         │
 ├────────►│          │            │           │         │
 │         │          │            │           │         │
 │ Submit  │          │            │           │         │
 ├────────►│          │            │           │         │
 │         │ POST /api│            │           │         │
 │         │ /submis  │            │           │         │
 │         │ sions    │            │           │         │
 │         │ {form_id,│            │           │         │
 │         │  data,   │            │           │         │
 │         │  lang:es}│            │           │         │
 │         ├─────────►│            │           │         │
 │         │          │            │           │         │
 │         │          │ translate_ │           │         │
 │         │          │ responses_ │           │         │
 │         │          │ to_english()          │         │
 │         │          ├───────────►│           │         │
 │         │          │            │ GPT call  │         │
 │         │          │            │ (batch    │         │
 │         │          │            │  translate│         │
 │         │          │            │  all      │         │
 │         │          │            │  fields)  │         │
 │         │          │            ├──────────►│         │
 │         │          │            │◄──────────┤         │
 │         │          │◄───────────┤ English   │         │
 │         │          │            │ responses │         │
 │         │          │            │           │         │
 │         │          │ INSERT     │           │         │
 │         │          │ submission │           │         │
 │         │          │ (English)  │           │         │
 │         │          ├─────────────────────────────────►│
 │         │          │            │           │         │
 │         │◄─────────┤            │           │         │
 │◄────────┤ Success  │            │           │         │
 │ Confirm │          │            │           │         │
```

---

## Technology Stack

### Frontend Technologies

- **React 19**: Latest React with concurrent features
- **Vite**: Next-gen frontend build tool
- **React Router**: Declarative routing
- **CSS Modules**: Scoped component styling
- **Context API**: Lightweight state management

### Backend Technologies

- **FastAPI**: Modern async Python web framework
- **SQLModel**: Type-safe ORM (Pydantic + SQLAlchemy)
- **Uvicorn**: ASGI server with async support
- **OpenAI SDK**: Official Python client for GPT API
- **Python 3.13**: Latest Python features

### Database

- **SQLite**: Embedded SQL database
- **SQLModel ORM**: Auto-migration support

### External Services

- **OpenAI GPT-4o-mini**: Cost-effective language model
- **Model Cost**: ~$0.01 per form translation
- **Response Time**: 1-3 seconds per translation

---

**Last Updated**: October 3, 2025  
**Diagrams Version**: 1.0.0
