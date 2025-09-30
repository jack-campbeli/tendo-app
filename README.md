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
medical-form-builder/
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI application
│   ├── models.py           # SQLModel database models
│   ├── tests/              # Backend tests
│   └── venv/               # Python virtual environment
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   └── pages/          # Page components
│   └── package.json        # Node.js dependencies
├── start_dev.sh           # Development startup script
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
pip install fastapi uvicorn sqlmodel pytest httpx
```

4. Run the backend server:

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

## 📚 API Documentation

Once the backend is running, visit:

- Interactive API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### Key Endpoints

- `POST /api/forms` - Create a new form
- `GET /api/forms/latest` - Get the most recent form
- `GET /api/forms/{form_id}` - Get a specific form
- `POST /api/submissions` - Submit form data
- `GET /api/submissions` - Get all submissions

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

### Forms Table

- `id`: UUID primary key
- `form_name`: String
- `fields`: JSON string containing form field definitions
- `created_at`: Timestamp

### Form Submissions Table

- `id`: UUID primary key
- `form_id`: Foreign key to forms table
- `submission_data`: JSON string containing submitted data
- `submitted_at`: Timestamp

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

- Implemented comprehensive form builder interface
- Added form submission handling
- Created responsive admin and user interfaces
- Added comprehensive test coverage
- Set up development environment with hot reloading
