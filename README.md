# Medical Form Builder

A full-stack web application for creating and managing dynamic medical forms. This project provides both an admin interface for form creation and a user interface for form submission.

## 🏗️ Architecture

- **Backend**: FastAPI with SQLModel (SQLite database)
- **Frontend**: React with Vite, Bootstrap for styling
- **Database**: SQLite with SQLModel ORM
- **Testing**: pytest for backend testing

## 🚀 Features

### Admin Interface

- Create dynamic forms with various field types
- Drag-and-drop form builder
- Real-time form preview
- Form management and editing

### User Interface

- Clean, responsive form display
- Multi-language support (English/Spanish) with AI translation
- Form submission handling
- Data validation
- Submission confirmation

### Backend API

- RESTful API endpoints
- Form CRUD operations
- Submission handling
- CORS support for frontend integration

## 📁 Project Structure

```
tendo-app/
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI application and routes
│   ├── models.py           # SQLModel database models
│   ├── services/           # Business logic services
│   │   └── translation_service.py  # OpenAI translation integration
│   ├── config/             # Configuration files
│   │   ├── constants.py    # App constants
│   │   └── api_key.txt     # OpenAI API key (gitignored)
│   ├── tests/              # Backend tests (pytest)
│   └── venv/               # Python virtual environment
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── common/     # Shared components
│   │   │   └── forms/      # Form-related components
│   │   ├── contexts/       # React Context providers
│   │   │   └── LanguageContext.jsx  # Multi-language support
│   │   ├── pages/          # Page components
│   │   └── main.jsx        # App entry point
│   └── package.json        # Node.js dependencies
├── docs/                   # Comprehensive documentation
│   ├── README.md           # API documentation
│   ├── api-spec.yaml       # OpenAPI specification
│   ├── swagger-ui.html     # Interactive API docs
│   ├── data-model.md       # Database schema documentation
│   ├── architecture.md     # System architecture details
│   └── diagrams.md         # Visual diagrams
├── start_dev.sh           # Development startup script
├── TRANSLATION_SETUP.md   # Translation feature setup guide
└── README.md              # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create and activate virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:

```bash
pip install -r requirements.txt
```

4. (Optional) Configure OpenAI API key for translation feature:

```bash
echo "your-openai-api-key-here" > api_key.txt
```

**Note**: Translation feature requires an OpenAI API key. See `TRANSLATION_SETUP.md` for details.

5. Run the backend server:

```bash
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Quick Start (Both Services)

Use the provided startup script to run both services simultaneously:

```bash
chmod +x start_dev.sh
./start_dev.sh
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📚 Documentation

### API Documentation

- **Interactive Docs**: `http://localhost:8000/docs` (FastAPI auto-generated)
- **OpenAPI Spec**: See `docs/api-spec.yaml`
- **Swagger UI**: Open `docs/swagger-ui.html` in browser
- **Full API Guide**: See `docs/README.md`

### Architecture Documentation

- **System Architecture**: See `docs/architecture.md` for detailed architecture diagrams and flows
- **Data Model**: See `docs/data-model.md` for database schema and relationships
- **Visual Diagrams**: See `docs/diagrams.md` for ASCII diagrams (ERD, sequence diagrams, etc.)
- **Translation Setup**: See `TRANSLATION_SETUP.md` for multi-language feature setup

### Key API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/forms` - Create a new form (with auto-translation)
- `GET /api/forms/latest?lang={code}` - Get the most recent form in any language
- `GET /api/forms/{form_id}` - Get a specific form
- `POST /api/submissions` - Submit form data (auto-translates to English)
- `GET /api/submissions` - Get all submissions
- `GET /api/users/{email}` - Get user profile

## 🔧 Development

### Backend Development

- Uses FastAPI for high-performance API development
- SQLModel for type-safe database operations
- SQLite for local development (easily switchable to PostgreSQL/MySQL)
- Comprehensive test suite with pytest

### Frontend Development

- React 19 with modern hooks
- Vite for fast development and building
- Bootstrap 5 for responsive UI components
- Component-based architecture

## 📝 Database Schema

> For detailed schema documentation with relationships and design rationale, see `docs/data-model.md`

### Core Tables

**Users Table**

- Single-table inheritance for Patient and Admin users
- Fields: id, email, password, user_type, first_name, last_name, created_at
- Patient-specific: recent_diagnosis, primary_care_physician

**Forms Table**

- `id`: UUID primary key
- `form_name`: String
- `fields`: JSON string (array of field definitions)
- `created_at`: Timestamp

**Form Submissions Table**

- `id`: Integer primary key
- `form_id`: References forms table
- `submission_data`: JSON string (key-value pairs)
- `submitted_at`: Timestamp

**Translated Forms Table** (Cache)

- `id`: Integer primary key
- `form_id`: References forms table (indexed)
- `language_code`: ISO 639-1 language code (indexed)
- `translated_form_name`: Translated title
- `translated_fields`: JSON string of translated fields
- `created_at`: Timestamp

## 🚀 Deployment

### Backend Deployment

1. Set up production database (PostgreSQL recommended)
2. Configure environment variables
3. Use production ASGI server (Gunicorn with Uvicorn workers)
4. Set up reverse proxy (Nginx)

### Frontend Deployment

1. Build production bundle: `npm run build`
2. Serve static files with web server
3. Configure API endpoint URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the API documentation at `/docs`
2. Review the test files for usage examples
3. Open an issue on GitHub

## 🔄 Recent Updates

- ✅ Implemented multi-language translation with OpenAI GPT-4o-mini
- ✅ Added translation caching for improved performance
- ✅ Created comprehensive API documentation with OpenAPI spec
- ✅ Implemented user authentication with Patient/Admin roles
- ✅ Added comprehensive form builder interface
- ✅ Created detailed architecture and data model documentation
- ✅ Set up comprehensive test coverage with pytest
- ✅ Configured development environment with hot reloading

## 📊 Diagrams and Architecture

The project includes comprehensive visual documentation:

1. **Entity Relationship Diagram** - Shows database schema and table relationships
2. **System Architecture Diagram** - Illustrates full-stack architecture with all layers
3. **Component Structure** - Details frontend and backend module organization
4. **Sequence Diagrams** - Shows flows for login, form creation, translation, and submission

All diagrams are available in `docs/diagrams.md` with detailed explanations in `docs/architecture.md` and `docs/data-model.md`.
