# Data Model Documentation

## Database Schema

This document describes the actual database schema implemented in the Tendo application.

## Physical Database Model

```
┌─────────────────────────────────────────────────────────┐
│                          User                           │
│                        (table)                          │
├─────────────────────────────────────────────────────────┤
│ PK  id: int                                             │
│ UQ  email: str                                          │
│     password: str                                       │
│     user_type: str ("patient" | "admin")                │
│     first_name: str                                     │
│     last_name: str                                      │
│     created_at: datetime                                │
│                                                         │
│     # Patient-specific fields (null for admin)          │
│     recent_diagnosis: str | null                        │
│     primary_care_physician: str | null                  │
└─────────────────────────────────────────────────────────┘
                              │
                              │ creates (0:n)
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                          Form                           │
│                        (table)                          │
├─────────────────────────────────────────────────────────┤
│ PK  id: str (UUID)                                      │
│     form_name: str                                      │
│     fields: str (JSON)                                  │
│     created_at: datetime                                │
│                                                         │
│     # JSON structure of fields:                         │
│     # [{                                                │
│     #   "id": "field_1",                                │
│     #   "label": "Field Label",                         │
│     #   "type": "text|email|date|...",                  │
│     #   "required": true|false,                         │
│     #   "placeholder": "...",                           │
│     #   "options": ["opt1", "opt2"] # if applicable.    │
│     # }]                                                │
└─────────────────────────────────────────────────────────┘
              │                           │
              │ has (1:n)                 │ has (0:n)
              │                           │
              ▼                           ▼
┌───────────────────────────┐   ┌────────────────────────────┐
│     TranslatedForm        │   │     FormSubmission         │
│       (table)             │   │        (table)             │
├───────────────────────────┤   ├────────────────────────────┤
│ PK  id: int              │   │ PK  id: int                │
│ FK  form_id: str (UUID)  │   │ FK  form_id: str (UUID)    │
│ IDX language_code: str   │   │     submission_data: str   │
│     translated_form_name │   │     (JSON)                 │
│     : str                │   │     submitted_at: datetime │
│     translated_fields    │   │                            │
│     : str (JSON)         │   │     # JSON structure:      │
│     created_at: datetime │   │     # {                    │
└───────────────────────────┘   │     #   "field_1": "val1",│
                                │     #   "field_2": "val2" │
                                │     # }                    │
                                └────────────────────────────┘
```

## Data Storage Strategy

The application uses a **simplified schema** with JSON storage for flexibility:

### Single-Table Inheritance

- **User table** uses a discriminator column (`user_type`) instead of separate tables
- Patient-specific fields are nullable and only populated for patient users
- This approach simplifies queries and reduces JOIN operations

### JSON Field Storage

Instead of normalized tables for fields and options, the application stores:

- **Form.fields**: Complete field definitions as JSON array
- **FormSubmission.submission_data**: All responses as JSON object
- **TranslatedForm.translated_fields**: Translated field definitions as JSON

**Benefits:**

- Schema flexibility: Add new field types without migrations
- Reduced complexity: Fewer tables and joins
- Better performance: Single query retrieves complete forms
- Easier translations: Translate entire JSON structures atomically

**Trade-offs:**

- Less queryable: Can't easily filter by specific field values
- Slightly larger storage: JSON overhead vs normalized data
- Client-side processing: Must parse JSON in application code

## Model Details

### User Model

```python
class User(SQLModel, table=True):
    id: int                              # Auto-increment primary key
    email: str                           # Unique, indexed
    password: str                        # Plain text (hash in production!)
    user_type: str                       # "patient" or "admin"
    first_name: str
    last_name: str
    created_at: datetime

    # Patient-only fields (None for admins)
    recent_diagnosis: Optional[str]
    primary_care_physician: Optional[str]
```

**Design Pattern**: Single-Table Inheritance

- All users in one table
- `user_type` discriminator determines behavior
- Null patient fields for admin users

### Form Model

```python
class Form(SQLModel, table=True):
    id: str                              # UUID primary key
    form_name: str                       # Display name
    fields: str                          # JSON array of field definitions
    created_at: datetime
```

**Field JSON Structure**:

```json
[
  {
    "id": "field_1",
    "label": "Full Name",
    "type": "text",
    "required": true,
    "placeholder": "Enter your name",
    "options": [] // For select/radio/checkbox types
  }
]
```

**Supported Field Types**:

- `text` - Single-line text
- `email` - Email validation
- `tel` - Phone number
- `date` - Date picker
- `number` - Numeric input
- `textarea` - Multi-line text
- `select` - Dropdown menu
- `checkbox` - Multiple selection
- `radio` - Single selection

### FormSubmission Model

```python
class FormSubmission(SQLModel, table=True):
    id: int                              # Auto-increment primary key
    form_id: str                         # References Form.id
    submission_data: str                 # JSON object of responses
    submitted_at: datetime
```

**Submission Data JSON Structure**:

```json
{
  "field_1": "John Doe",
  "field_2": "john@example.com",
  "field_3": "1990-05-15"
}
```

### TranslatedForm Model

```python
class TranslatedForm(SQLModel, table=True):
    id: int                              # Auto-increment primary key
    form_id: str                         # References Form.id (indexed)
    language_code: str                   # ISO 639-1 code (indexed)
    translated_form_name: str            # Translated form title
    translated_fields: str               # JSON of translated fields
    created_at: datetime
```

**Purpose**: Cache translations to:

- Prevent repeated API calls
- Reduce OpenAI costs
- Improve response times
- Enable offline operation

**Composite Index**: `(form_id, language_code)` for fast lookups

## Request/Response Models

These are **not stored in the database** but used for API communication:

### LoginRequest

```python
class LoginRequest(BaseModel):
    email: str
    password: str
```

### LoginResponse

```python
class LoginResponse(BaseModel):
    success: bool
    user_type: str
    email: str
    first_name: str
    last_name: str
    message: str
```

## Indexes and Performance

### Indexed Columns

- `User.email` - Unique index for fast login lookups
- `TranslatedForm.form_id` - Fast translation lookups
- `TranslatedForm.language_code` - Filter by language

### Query Patterns

1. **Get Latest Form**: `ORDER BY created_at DESC LIMIT 1`
2. **User Login**: `WHERE email = ?` (uses unique index)
3. **Get Translation**: `WHERE form_id = ? AND language_code = ?`
4. **Get Submissions**: `ORDER BY submitted_at DESC`

## Future Expansion

The User model includes commented fields for future features:

- `medications`: List of current medications (JSON)
- `allergies`: Medical allergies (JSON)
- `medical_history`: Historical conditions (JSON)
- `insurance_info`: Insurance details (JSON)

These can be added without breaking existing code due to Optional typing.

## Migration Notes

Since the application uses SQLModel with SQLite:

- Tables are created automatically on startup via `SQLModel.metadata.create_all()`
- No manual migrations needed for new deployments
- Schema changes require database recreation or manual ALTER TABLE commands
- Consider using Alembic for production migrations

---

**Last Updated**: October 3, 2025
**Schema Version**: 1.0.0
